import { HttpException, HttpStatus } from '@nestjs/common';
import * as bycrypt from 'bcrypt';
import { Request } from 'express';
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
    throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
  }
};

// Pagination function
export const paginate = (
  data: any,
  options: { page: number; limit: number },
) => {
  const { page = 1, limit = 10 } = options;
  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const items = data.slice(startIndex, endIndex);
  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
  };

  return { items, meta };
};

// Check if admin_token toke is there
export const validateRequest = (req: Request) => {
  const clientToken = req.headers.cookie;
  if (clientToken.includes('admin_token')) return Boolean(req.headers.cookie);
};
