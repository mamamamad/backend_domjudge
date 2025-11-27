import dotenv from "dotenv";

dotenv.config();

export const config = {
  domjudge: {
    apiBase: process.env.DOMJUDGE_API_BASE || "api.birjand.ir",
    username: process.env.DOMJUDGE_USERNAME || "admin",
    password: process.env.DOMJUDGE_PASSWORD || "",
    contestId: process.env.DOMJUDGE_CONTEST_ID || "1",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  contest: {
    baseDir: process.env.CONTEST_BASE_DIR || "./data",
    stateName: process.env.CONTEST_STATE_NAME || "contest",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  organization: ["University of Birjand"],
  apiKeyEmail: process.env.PASSWORD_EMAIL || "test",
  Email: process.env.EMAIL || "",
};

// Validate required environment variables
if (!config.domjudge.password) {
  console.warn("Warning: DOMJUDGE_PASSWORD is not set");
}

if (!config.domjudge.apiBase) {
  console.log(config.domjudge.apiBase);
  throw new Error("DOMJUDGE_API_BASE is required");
}
