import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  saltRounds: number;
  jwtSecret: string;

  constructor() {
    this.saltRounds = 10;
    this.jwtSecret = process.env.JWT_SECRET;
  }

  getHashPassword = (plainPassword: string) => {
    const salt = bcrypt.genSaltSync(this.saltRounds);
    const hash = bcrypt.hashSync(plainPassword, salt);
    return hash;
  };

  isHashedPasswordVerified = (plainPassword: string, passwordInDB: string) => {
    return !!bcrypt.compareSync(plainPassword, passwordInDB);
  };

  createToken = (userInDB: any) => {
    const token = jwt.sign(userInDB, this.jwtSecret);
    return token;
  };

  decodeToken = (token: any) => {
    return jwt.decode(token);
  };

  verifyToken = (token: any) => {
    return jwt.verify(token, this.jwtSecret);
  };
}
