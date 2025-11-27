import { Router } from "express";
import { body } from "express-validator";
import { createTeam, sendEmail } from "../controllers/teamController.mjs";
import { validateRequest, basicAuth } from "../middleware/validation.mjs";

const router = Router();

// Validation rules
const createTeamValidation = [
  body("teamname").notEmpty().withMessage("Team name is required"),
  body("organization_id")
    .notEmpty()
    .withMessage("organization_id name is required"),
  body("descriptions")
    .notEmpty()
    .withMessage("organization_id name is required"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("display_name").optional().isString(),
  body("phoneNumber").optional().isString(),
];

const createTeamsBulkValidation = [
  body("teams")
    .isArray()
    .withMessage("Teams must be an array")
    .notEmpty()
    .withMessage("Teams array cannot be empty"),
  body("teams.*.team")
    .notEmpty()
    .withMessage("Team name is required for all teams"),
  body("teams.*.uni")
    .notEmpty()
    .withMessage("University name is required for all teams"),
  body("teams.*.username").optional().isString(),
  body("teams.*.password").optional().isString(),
  body("teams.*.email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),
  body("teams.*.names").optional().isString(),
  body("teams.*.phone").optional().isString(),
  body("dryRun").optional().isBoolean(),
];
// basicAuth.js

// Routes - All API documentation is in swagger.yaml
router.post("/teams", validateRequest, createTeam);
router.get("/sendEmail", basicAuth, sendEmail);

export default router;
