import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  saltRounds: number;
  jwtSecret: string;
  encryptionKey: Buffer;

  constructor() {
    this.saltRounds = 10;
    this.jwtSecret = process.env.JWT_SECRET;

    this.encryptionKey = crypto.scryptSync(
      process.env.ENCRYPTION_SECRET,
      'salt',
      32,
    );
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

  // Encrypt a value using AES encryption
  encryptValue = (value: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  };

  // Decrypt a value using AES decryption
  decryptValue = (encryptedValue: string) => {
    const [ivHex, encryptedData] = encryptedValue.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      iv,
    );

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  };
}
