import domjudgeService from "../services/domjudgeService.mjs";
import {
  generateUniqueId,
  generatePassword,
  generateUsername,
  ensureUniqueUsername,
} from "../utils/idGenerator.mjs";
import { addDataToJson } from "../utils/addToJson.mjs";
import logger from "../utils/logger.mjs";
import { config } from "../config/index.mjs";
import sendEmail from "../services/emailService.mjs";

/**
 * Create a single team and user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function createTeam(req, res) {
  try {
    const teamData = req.body;

    /*
    teamData= {
    teamName:m,
    display_name:m,
    descriptions:xxx,
    organization_id = uni,
    email:x@x.com,
    phoneNumber
    users: ["mamad","hasan","karim"]
    }

    */
    // Validate required fields

    if (!teamData.teamname || !teamData.organization_id) {
      res.status(400).json({
        success: false,
        error:
          "Team name and university name are required or university name is not true.",
      });
      return;
    }

    // Fetch existing data
    const [existingOrgs, existingTeams, existingUsers] = await Promise.all([
      domjudgeService.getOrganizations(),
      domjudgeService.getTeams(),
      domjudgeService.getUsers(),
    ]);

    // Check if team already exists
    if (existingTeams.has(teamData.teamname)) {
      res.status(409).json({
        success: false,
        error: `Team '${teamData.teamname}' already exists`,
      });

      return;
    }

    // Prepare ID sets
    const existingIds = new Set([
      ...existingTeams.values(),
      ...existingUsers.values(),
    ]);

    const existingUsernames = new Set(existingUsers.keys());

    // Generate unique ID
    const uniqueId = generateUniqueId(existingIds);

    // Create or get organization
    await domjudgeService.createOrGetOrganization(
      teamData.organization_id,
      existingOrgs
    );

    // Generate or use provided username
    let username = teamData.username;
    if (!username) {
      username = generateUsername(uniqueId);
    }
    username = ensureUniqueUsername(username, existingUsernames);

    // Generate or use provided password
    const password = generatePassword(10);

    // Create team
    const teamPayload = {
      icpc_id: `${uniqueId}`, // must be unique
      id: `${uniqueId}`, // optional, can remove
      name: teamData.teamname?.trim() || "",
      organization_id: teamData.organization_id?.trim() || "",
      display_name: teamData.display_name?.trim() || "",
      description: teamData.descriptions?.trim() || "",
      label: teamData.teamname?.trim() || "",
      public_description: teamData.teamname?.trim() || "",
      location: "null",
      members: "null",
      group_ids: ["3"],
    };
    let createData = {};

    const createdTeam = await domjudgeService.createTeam(teamPayload);

    let userPayload = {
      username,
      name: element,
      email: teamData.email,
      password,
      enabled: true,
      team_id: uniqueId,
      roles: ["team"],
    };
    console.log(userPayload);
    const createdUser = await domjudgeService.createUser(userPayload);
    console.log(createdUser);
    createData = {
      success: true,
      email: teamData.email,
      teamId: createdTeam.id,
      userId: createdUser.id,
      username,
      password,
    };

    console.log(createData);

    const sendEmailStatus = sendEmail(createData);
    console.log(
      `the ${sendEmailStatus.email} is sended: ${sendEmailStatus.success}`
    );
    addDataToJson("registerUser.json", teamData);
    addDataToJson("userPass.json", createData);
    addDataToJson("sendemail.json", sendEmailStatus);

    res.status(201).json({
      success: true,
      email: teamData.email,
      emailstatus: sendEmailStatus.success,
      username,
      password,
    });
  } catch (error) {
    logger.error("Error creating team", { error, teamData: req.body });
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create team",
    });
  }
}
