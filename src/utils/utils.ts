import { HttpStatus } from '@nestjs/common';
import * as bycrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Encrypt password or match password
export const encryptPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const salt = await bycrypt.genSalt(saltRounds);
  return bycrypt.hash(password, salt);
};

export const checkPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bycrypt.compare(password, hashedPassword);
};

// Generate web token and check web token
export const generateJwtToken = (email: string, password: string) => {
  const secretKey = process.env.JWT_SECRET;
  return jwt.sign({ email, password }, secretKey, { expiresIn: '2h' });
};

export const verifyToken = async (token: string) => {
  const secretKey = process.env.JWT_SECRET;
  try {
    const details = await jwt.verify(token, secretKey);
    return details;
  } catch (error) {
    return { status: HttpStatus.FORBIDDEN, message: 'invalid token' };
  }
};
