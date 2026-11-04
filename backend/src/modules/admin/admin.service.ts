import { prisma } from '../../config/prisma';
import { ConflictError } from '../../common/errors';
import { hashPassword } from '../auth/password';
import type { AdminSignupRequest } from './admin.schema';

/**
 * Java: AdminSignupAssembler.buildModel.
 *
 * AdminSignupResponseBean declared password, phone, address, city, state, zip
 * and country, but the assembler set only name, email and username — the rest
 * serialised as null. Password in particular is never echoed back.
 */
export interface AdminSignupResponse {
  name: string | null;
  username: string | null;
  email: string | null;
}

/** Java: AdminServiceImpl.adminSignUp */
export async function adminSignUp(req: AdminSignupRequest): Promise<AdminSignupResponse> {
  if (req.userName && req.password) {
    const existing = await prisma.users.findFirst({
      where: { userName: req.userName, authenticationType: 'ADMIN' },
    });
    if (existing) {
      throw new ConflictError(`User name '${req.userName}' already exists`);
    }
  }

  const admin = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        authenticationType: 'ADMIN',
        email: req.email,
        name: req.name ?? null,
        userName: req.userName ?? null,
        sPhrase: req.password ? await hashPassword(req.password) : null,
      },
    });

    return tx.admin.create({
      data: {
        email: req.email,
        name: req.name ?? null,
        userName: req.userName ?? null,
        usersEntity: { connect: { id: user.id } },
      },
    });
  });

  return { name: admin.name, username: admin.userName, email: admin.email };
}
