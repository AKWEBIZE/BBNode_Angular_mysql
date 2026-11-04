import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError, ForbiddenError } from '../common/errors';
import { verifyToken } from '../modules/auth/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { userName: string; roles: string[] };
    }
  }
}

/** Java equivalent: JwtAuthFilter populating the SecurityContext. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token');
  }
  const payload = verifyToken(header.slice('Bearer '.length).trim());
  req.user = { userName: payload.sub, roles: payload.Roles };
  next();
}

/** Java equivalent: @PreAuthorize / SecurityConfig role matchers. */
export function requireRole(...allowed: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    const held = req.user.roles.map((r) => r.toUpperCase());
    if (!allowed.some((r) => held.includes(r.toUpperCase()))) {
      throw new ForbiddenError('Insufficient role');
    }
    next();
  };
}
