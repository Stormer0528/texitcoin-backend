import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';

export const createAccessToken = ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
  return sign({ id, isAdmin }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN });
};

export const hashPassword = async (password: string) => {
  return await hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};

export const verifyToken = (token: string) => {
  return verify(token, process.env.JWT_SECRET!);
};

export const generateRandomString = (length: number) => {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/\+/g, '0') // Replace '+' with '0' to ensure a valid URL-safe string
    .replace(/\//g, '0'); // Replace '/' with '0' to ensure a valid URL-safe string
};

export const createVerificationToken = (verification: string | number) => {
  return sign({ verification }, process.env.JWT_SECRET!, { expiresIn: '10m' });
};
