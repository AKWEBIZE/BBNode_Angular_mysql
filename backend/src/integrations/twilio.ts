import twilio, { type Twilio } from 'twilio';
import { env } from '../config/env';
import { AppError } from '../common/errors';

let client: Twilio | null = null;

function getClient(): Twilio {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    throw new AppError('Twilio is not configured', 503, 'TWILIO_NOT_CONFIGURED');
  }
  client ??= twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
}

/** Java: TwilioVerifyService.sendVerification */
export async function sendVerification(phoneNumber: string, channel = 'sms'): Promise<string> {
  const verification = await getClient()
    .verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({ to: phoneNumber, channel });
  return verification.status;
}

/** Java: TwilioVerifyService.checkVerification */
export async function checkVerification(phoneNumber: string, code: string): Promise<boolean> {
  const check = await getClient()
    .verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({ to: phoneNumber, code });
  return check.status?.toLowerCase() === 'approved';
}
