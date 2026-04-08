import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const hasUser = !!process.env.GMAIL_USER;
  const hasPass = !!process.env.GMAIL_APP_PASSWORD;
  const user = process.env.GMAIL_USER || "NOT SET";

  if (!hasUser || !hasPass) {
    return NextResponse.json({ error: "Missing env vars", hasUser, hasPass, user });
  }

  try {
    await sendEmail({
      to: "jonkoma@gmail.com",
      subject: "AEROPARKING — Test email",
      html: "<h1>Test</h1><p>Si ves esto, el email funciona.</p>",
    });
    return NextResponse.json({ ok: true, sentTo: "jonkoma@gmail.com", from: user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, hasUser, hasPass, user });
  }
}
