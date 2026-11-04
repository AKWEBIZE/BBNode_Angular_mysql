import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../common/errors';

export interface JwtPayload {
  sub: string;
  Roles: string[];
}

/**
 * Claim name is capital-R "Roles" to match the Java JwtUtils, which wrote
 * .claim("Roles", list). Anything already holding a token keeps working.
 */
function sign(userName: string, roles: string[], expiresIn: string): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ Roles: roles }, env.JWT_SECRET, { subject: userName, ...options });
}

export function generateToken(userName: string, roles: string[]): string {
  return sign(userName, roles, env.JWT_ACCESS_EXPIRES_IN);
}

export function generateRefreshToken(userName: string, roles: string[]): string {
  return sign(userName, roles, env.JWT_REFRESH_EXPIRES_IN);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new UnauthorizedError('Malformed token');
    }
    return {
      sub: String(decoded.sub),
      Roles: Array.isArray((decoded as Record<string, unknown>).Roles)
        ? ((decoded as Record<string, unknown>).Roles as string[])
        : [],
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    const reason = err instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token';
    throw new UnauthorizedError(reason);
  }
}
