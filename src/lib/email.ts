import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';

// Create reusable transporter object using Zoho's SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.ZOHO_EMAIL || "orders@flenjure.com",
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  react,
  isInternalAdminAlert = false,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  isInternalAdminAlert?: boolean;
}) {
  try {
    if (!process.env.ZOHO_APP_PASSWORD) {
      console.warn("ZOHO_APP_PASSWORD is not set. Email not sent.");
      return { success: false, error: "Missing App Password" };
    }

    // Generate HTML from React component
    const html = await render(react);
    
    // Zoho demands that the "From" address exactly matches the authenticated user.
    // We can change the display name, but the email must be orders@flenjure.com.
    const fromName = isInternalAdminAlert ? "Flenjure System" : "Flenjure";
    const fromAddress = process.env.ZOHO_EMAIL || "orders@flenjure.com";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email via Zoho Nodemailer:", error);
    return { success: false, error };
  }
}
