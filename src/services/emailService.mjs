import "dotenv/config";
import { config } from "../config/index.mjs";
import nodemailer from "nodemailer";

export async function SendEmail(data) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.Email,
      pass: config.apiKeyEmail,
    },
  });
  if (success) {
    const BODY_TEMPLATE = ({ username, password }) => `
سلام بچه‌ها،

اطلاعات ورود شما به شرح زیر است:

یوزرنیم: ${username}
پسورد: ${password}

برای شرکت در مسابقه، به آدرس زیر مراجعه کنید:
https://bircpc.ir/

اگر مشکلی در ورود به سایت داشتید یا سوالی برایتان پیش آمد، از طریق ایمیل یا گروه تلگرام ما را مطلع کنید.

همچنین می‌تونید اخبار و اطلاعات بیشتر در مورد مسابقه‌مون رو توی وبلاگ دنبال کنید:
https://blog.bircpc.ir/

با آرزوی موفقیت،
انجمن علمی کامپیوتر دانشگاه بیرجند
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
    return { success: true, email: data.email };
  }
  return { success: false, email: data.email };
}
