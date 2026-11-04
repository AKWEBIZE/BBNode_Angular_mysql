import { prisma } from '../../config/prisma';
import { ConflictError, UnauthorizedError } from '../../common/errors';
import { hashPassword, isBcryptHash, verifyPassword } from '../auth/password';
import {
  toBuyerSignupResponse,
  type BuyerInfoResponse,
  type BuyerSignupResponse,
} from './buyer.assembler';
import type { BuyerSigninRequest, BuyerSignupRequest } from './buyer.schema';

const LOGIN_SUCCESSFULLY = 'Login successfully';

/**
 * Java: BuyerSignupServiceImpl.buyerSignUp.
 *
 * The Java builder never set userName or password on BuyerEntity, which left
 * /buyer/sign-in and /buyer/exist-username permanently broken — no buyer row
 * ever had a username to match. Both are persisted here.
 */
export async function buyerSignUp(req: BuyerSignupRequest): Promise<BuyerSignupResponse> {
  if (req.email && req.phone) {
    const existing = await prisma.buyer.findFirst({
      where: { OR: [{ email: req.email }, { phone: req.phone }] },
    });
    if (existing) {
      throw new ConflictError('Email or phone number already exists');
    }
  }

  if (req.userName && req.password) {
    const [userExists, buyerExists] = await Promise.all([
      prisma.users.findFirst({ where: { userName: req.userName, authenticationType: 'BUYER' } }),
      prisma.buyer.findFirst({ where: { userName: req.userName } }),
    ]);
    if (userExists || buyerExists) {
      throw new ConflictError('UserName Already Exist');
    }
  }

  const hashed = req.password ? await hashPassword(req.password) : null;

  const buyer = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        authenticationType: 'BUYER',
        email: req.email ?? null,
        name: req.name ?? null,
        userName: req.userName ?? null,
        sPhrase: hashed,
      },
    });

    return tx.buyer.create({
      data: {
        name: req.name ?? null,
        userName: req.userName ?? null,
        email: req.email ?? null,
        address: req.address ?? null,
        phone: req.phone ?? null,
        state: req.state ?? null,
        zip: req.zip ?? null,
        city: req.city ?? null,
        country: req.country ?? null,
        password: hashed,
        usersEntity: { connect: { id: user.id } },
      },
    });
  });

  return toBuyerSignupResponse(buyer);
}

/**
 * Java: BuyerSignupServiceImpl.buyerLogin.
 *
 * The original compared against Base64(JSON(password)) — an encoding, not a
 * hash, so the stored value was equivalent to plaintext. It also matched on a
 * column signup never populated, so the endpoint could not succeed at all.
 * bcrypt is used here, against the hash written at signup.
 */
export async function buyerLogin(req: BuyerSigninRequest): Promise<BuyerInfoResponse> {
  const buyer = await prisma.buyer.findFirst({ where: { userName: req.userName } });

  if (!buyer?.password || !isBcryptHash(buyer.password)) {
    throw new UnauthorizedError('Invalid Credentials');
  }

  if (!(await verifyPassword(req.password, buyer.password))) {
    throw new UnauthorizedError('Invalid Credentials');
  }

  return {
    buyerId: buyer.id,
    name: buyer.name,
    phone: buyer.phone,
    email: buyer.email,
    userName: buyer.userName,
    message: LOGIN_SUCCESSFULLY,
  };
}

/** Java: BuyerSignupServiceImpl.existUsername */
export async function existUsername(username: string | undefined): Promise<boolean> {
  if (!username) return false;
  return (await prisma.buyer.count({ where: { userName: username } })) > 0;
}

/** Java: BuyerSignupServiceImpl.existEmailorPhone */
export async function existEmailOrPhone(
  email: string | undefined,
  phone: string | undefined,
): Promise<boolean> {
  if (!email && !phone) return false;

  const or = [];
  if (email) or.push({ email });
  if (phone) or.push({ phone });

  return (await prisma.buyer.count({ where: { OR: or } })) > 0;
}
