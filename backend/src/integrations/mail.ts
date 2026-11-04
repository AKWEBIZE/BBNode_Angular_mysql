import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(env.MAIL_HOST && env.MAIL_USER && env.MAIL_PASSWORD);
}

function getTransporter(): Transporter {
  if (!isMailConfigured()) {
    throw new Error('Mail is not configured');
  }
  transporter ??= nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    // 465 is implicit TLS; anything else upgrades with STARTTLS. The Java config
    // set both ssl.enable and starttls.enable on port 465, which is contradictory.
    secure: env.MAIL_PORT === 465,
    auth: { user: env.MAIL_USER, pass: env.MAIL_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  bcc?: string[];
}

/**
 * Sends a message, returning false instead of throwing.
 *
 * The Java ContactServiceImpl caught and logged any mail failure so the contact
 * record was still saved; that behaviour is kept, but the caller is told whether
 * delivery actually happened.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn('Mail not configured; skipping send to %s', message.to);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: env.MAIL_FROM ?? env.MAIL_USER,
      to: message.to,
      bcc: message.bcc?.length ? message.bcc : undefined,
      subject: message.subject,
      html: message.html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send mail to %s:', message.to, err);
    return false;
  }
}
