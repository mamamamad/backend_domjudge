import "dotenv/config";
import { config } from "../config/index.mjs";
import nodemailer from "nodemailer";

export default async function SendEmail(data) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.Email,
      pass: config.apiKeyEmail,
    },
  });
  console.log({
    user: config.Email,
    pass: config.apiKeyEmail,
  });
  if (data.success) {
    const BODY_TEMPLATE = ({ username, password }) => `
Your login information is as follows:

Username: ${username}
Password: ${password}

To participate in the contest, please visit:
https://bircpc.ir/

If you experience any issues logging in or have any questions, feel free to contact us via Telegram group.

You can also follow our blog for more news and updates about the contest:
https://blog.bircpc.ir/

Wishing you the best of luck,
Birjand University Computer Science Student Association.
`;

    await transporter.sendMail({
      from: `"BIRCPC" ${config.Email}`,
      to: data.email,
      subject: "BCPC",
      text: BODY_TEMPLATE({ username: data.username, password: data.password }),
      html: `<pre>${BODY_TEMPLATE({
        username: data.username,
        password: data.password,
      })}</pre>`,
    });
    let result = { success: true, email: data.email };
    return result;
  }
  let result = { success: false, email: data.email };
  return result;
}
