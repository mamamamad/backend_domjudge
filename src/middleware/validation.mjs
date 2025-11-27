import { validationResult } from "express-validator";
import { config } from "../config/index.mjs";
/**
 * Middleware to validate request using express-validator
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array(),
    });
    return;
  }
  next();
}

export function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Restricted Area"');
    return res.status(401).send("Authentication required.");
  }

  // Decode base64 credentials
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // Check credentials
  const validUsername = config.domjudge.username;
  const validPassword = config.domjudge.password;

  if (username === validUsername && password === validPassword) {
    // Auth successful
    console.log("Auth successful");
    return next();
  } else {
    res.setHeader("WWW-Authenticate", 'Basic realm="Restricted Area"');
    return res.status(401).send("Invalid credentials.");
  }
}
