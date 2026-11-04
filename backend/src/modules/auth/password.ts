import bcrypt from 'bcryptjs';

/**
 * The Java service stored passwords with a reversible cipher and compared via
 * encryptionUtils.decrypt(...), meaning every stored password was recoverable.
 * This port hashes with bcrypt instead, so stored credentials cannot be read back.
 *
 * Consequence: existing sPhrase values from the Postgres database cannot be
 * verified here. Users must reset their passwords, or you run a one-off script
 * that decrypts with the old Java cipher and re-hashes. See README.
 */
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** bcrypt hashes always carry this prefix; anything else is a legacy value. */
export function isBcryptHash(value: string | null | undefined): boolean {
  return !!value && /^\$2[aby]\$/.test(value);
}
