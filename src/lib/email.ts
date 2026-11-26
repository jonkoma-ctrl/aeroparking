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
  /** Lo que va al log en vez del mail (ej. el código KP), para no loguear datos personales. */
  logLabel?: string;
}

export async function sendEmail({ to, subject, html, logLabel }: SendEmailOptions) {
  const who = logLabel ?? to;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set, skipping email");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"KingPark" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("[email] Sent to", who, "messageId:", info.messageId);
  } catch (err) {
    console.error("[email] Error sending to", who, logLabel ? "" : err);
    throw err;
  }
}
