import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const sendMail = async ({ from, to, subject, html }) => {
  const result = await client.transactionalEmails.sendTransacEmail({
    sender: { email: from },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
  return result;
};

export { sendMail };
