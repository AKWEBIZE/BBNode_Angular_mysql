import { prisma } from '../../config/prisma';
import { OtpLoginError } from '../../common/errors';
import { checkVerification, sendVerification } from '../../integrations/twilio';
import { generateRefreshToken, generateToken } from './jwt';
import { isBcryptHash, verifyPassword } from './password';
import type { LoginRequest, SendOtpRequest, ValidateOtpRequest } from './auth.schema';

export interface LoginResponse {
  message: string;
  roles?: string[];
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Java: AuthServiceImpl.userLogin.
 *
 * Two deliberate differences from the original, both noted in the README:
 *  - passwords are bcrypt-verified rather than decrypted and compared;
 *  - a successful login issues tokens. The Java version returned only
 *    message + roles, so the frontend got no credential from /auth/login.
 */
export async function userLogin(req: LoginRequest): Promise<LoginResponse> {
  const user = await prisma.users.findFirst({
    where: { userName: req.username, authenticationType: req.authenticationType },
  });

  const invalid: LoginResponse = { message: 'Invalid username or password' };
  if (!user?.sPhrase) return invalid;

  // Legacy rows still hold the old reversible cipher; they cannot be verified here.
  if (!isBcryptHash(user.sPhrase)) return invalid;

  if (!(await verifyPassword(req.password, user.sPhrase))) return invalid;

  const roles = [req.authenticationType];
  return {
    message: 'Login success',
    roles,
    accessToken: generateToken(req.username, roles),
    refreshToken: generateRefreshToken(req.username, roles),
  };
}

export function refreshTokens(userName: string, roles: string[]): LoginResponse {
  return {
    message: 'Token refreshed',
    roles,
    refreshToken: generateRefreshToken(userName, roles),
  };
}

export async function sendOtp(req: SendOtpRequest): Promise<{ message: string }> {
  await sendVerification(req.phoneNumber, req.channel);
  return { message: 'Otp sent successfully' };
}

/** Java: AuthController.checkOtp */
export async function validateOtp(req: ValidateOtpRequest): Promise<LoginResponse> {
  let approved: boolean;
  try {
    approved = await checkVerification(req.phoneNumber, req.code);
  } catch (err) {
    throw new OtpLoginError(err instanceof Error ? err.message : 'OTP verification failed');
  }

  if (!approved) throw new OtpLoginError('Invalid OTP');

  // Role is hard-coded to Seller in the Java controller; preserved here.
  const roles = ['Seller'];
  return {
    message: 'Login success',
    roles,
    accessToken: generateToken(req.userName, roles),
    refreshToken: generateRefreshToken(req.userName, roles),
  };
}
