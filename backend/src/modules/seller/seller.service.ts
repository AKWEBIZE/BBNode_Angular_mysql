import { prisma } from '../../config/prisma';
import { ConflictError, UnauthorizedError } from '../../common/errors';
import { checkVerification } from '../../integrations/twilio';
import { hashPassword } from '../auth/password';
import { toSellerResponse, type SellerResponse } from './seller.assembler';
import type { SellerSignInRequest, SellerSignupRequest } from './seller.schema';

const LOGIN_SUCCESSFULLY = 'Login successfully';

/** Java: SellerServiceImpl.sellerSignUp */
export async function sellerSignUp(req: SellerSignupRequest): Promise<SellerResponse> {
  if (req.email && req.phone) {
    const existing = await prisma.seller.findFirst({
      where: { OR: [{ email: req.email }, { phone: req.phone }] },
    });
    if (existing) {
      throw new ConflictError('Email or phone number already exists');
    }
  }

  if (req.username) {
    const existingUser = await prisma.users.findFirst({
      where: { userName: req.username, authenticationType: 'SELLER' },
    });
    if (existingUser) {
      throw new ConflictError(`User name '${req.username}' already exists`);
    }
  }

  // One transaction so a failure cannot leave a Users row without its Seller.
  const seller = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        authenticationType: 'SELLER',
        email: req.email ?? null,
        name: req.name ?? null,
        userName: req.username ?? null,
        sPhrase: req.password ? await hashPassword(req.password) : null,
      },
    });

    return tx.seller.create({
      data: {
        name: req.name ?? null,
        email: req.email ?? null,
        phone: req.phone ?? null,
        zip: req.zip ?? null,
        state: req.state ?? null,
        city: req.city ?? null,
        country: req.country ?? null,
        // Java wrote getCity() here; the request's own address is used instead.
        address: req.address ?? null,
        status: 'PENDING',
        usersEntity: { connect: { id: user.id } },
      },
    });
  });

  return toSellerResponse(seller);
}

/**
 * Java: SellerServiceImpl.sellerSignIn.
 *
 * The original only checked anything when both mobileNumber and otp were
 * non-empty, and even then merely confirmed the phone existed — the OTP was
 * never verified. An empty body returned "Login successfully". Here both
 * fields are required and the OTP is checked against Twilio.
 */
export async function sellerSignIn(req: SellerSignInRequest): Promise<Record<string, string>> {
  const seller = await prisma.seller.findFirst({ where: { phone: req.mobileNumber } });
  if (!seller) {
    throw new UnauthorizedError('Invalid Credentials');
  }

  const phone = req.countryCode ? `${req.countryCode}${req.mobileNumber}` : req.mobileNumber;
  if (!(await checkVerification(phone, req.otp))) {
    throw new UnauthorizedError('Invalid Credentials');
  }

  return { message: LOGIN_SUCCESSFULLY };
}
