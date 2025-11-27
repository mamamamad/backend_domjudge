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
import fs from "fs/promises";
/**
 * Create a single team and user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function createTeam(req, res) {
  let createData = {};
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
      display_name: teamData.teamname?.trim() || "" || "",
      description: teamData.descriptions?.trim() || "",
      label: teamData.teamname?.trim() || "",
      public_description: teamData.teamname?.trim() || "",
      location: "null",
      members: "null",
      group_ids: ["participants"],
    };

    const createdTeam = await domjudgeService.createTeam(teamPayload);
    if (createdTeam) {
      let userPayload = {
        username,
        name: teamData.users[0],
        email: teamData.email,
        password,
        enabled: true,
        team_id: `${uniqueId}`,
        roles: ["team"],
      };
      const createdUser = await domjudgeService.createUser(userPayload);
      createData = {
        success: true,
        teamname: teamData.teamname?.trim() || "",
        email: teamData.email,
        teamId: createdTeam.id,
        userId: createdUser.id,
        username,
        password,
      };
    }
    addDataToJson("registerUser.json", teamData);
    addDataToJson("userPass.json", createData);

    const sendEmailStatus = await sendEmail(createData);

    if (sendEmailStatus.success) {
      console.log(
        `the ${sendEmailStatus.email} is sended: ${sendEmailStatus.success}`
      );
      addDataToJson("emailData.json", sendEmailStatus);
    } else {
      console.log(
        `the ${sendEmailStatus.email} is not sended: ${sendEmailStatus.success}`
      );
      addDataToJson("emailData.json", sendEmailStatus);
    }
    res.status(201).json({
      success: true,
      email: teamData.email,
      emailstatus: sendEmailStatus.success,
      username,
      password,
    });
  } catch (erro) {
    logger.error("Error creating team", { erro, teamData: req.body });

    addDataToJson("registerUser.json", teamData);
    addDataToJson("userPass.json", createData);
    res.status(500).json({
      success: false,
      error: erro.message || "Failed to create team",
    });
  }
}

export async function sendEmailagain(req, res) {
  try {
    const statusRaw = await fs.readFile("emailData.json", "utf-8");
    const statuses = JSON.parse(statusRaw);

    // 2️⃣ Read user data file
    const userRaw = await fs.readFile("userPass.json", "utf-8");
    const users = JSON.parse(userRaw);

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];

      // Only resend for failed emails
      if (status.success === false) {
        // Find user data matching the email
        const userData = users.find((u) => u.email === status.email);

        if (!userData) {
          console.log(`No user data found for ${status.email}`);
          continue;
        }

        // 4️⃣ Send email again
        try {
          const result = await sendEmail(userData);
          if (result.success) {
            console.log(`Email sent successfully to ${status.email}`);
            // Update status
            statuses[i].success = true;
          } else {
            console.log(`Failed again to send email to ${status.email}`);
          }
        } catch (err) {
          console.error(`Error sending email to ${status.email}:`, err.message);
        }
      }

      await fs.writeFile("emailData.json", JSON.stringify(statuses, null, 2));
      console.log("Status file updated.");
    }
  } catch (e) {
    console.log(`errro in ${e}`);
  }
}
