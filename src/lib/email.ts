import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Whitelist de test — solo estos reciben emails hasta salir a producción
const TEST_EMAILS = [
  "jonkoma@gmail.com",
  "reservas@nrauditores.com.ar",
  "jon@masmetros.com.ar",
];

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set, skipping email");
    return;
  }

  if (!TEST_EMAILS.includes(to.toLowerCase())) {
    console.log("[email] Skipped (not in test whitelist):", to);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"AEROPARKING" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("[email] Sent to", to, "messageId:", info.messageId);
  } catch (err) {
    console.error("[email] Error sending to", to, err);
    throw err;
  }
}
