import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { LoginUserDto } from './dto/auth.dto';
import {
  checkPassword,
  encryptPassword,
  generateJwtToken,
} from 'src/utils/utils';
import { IdentityService } from 'src/identity/identity.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private identityService: IdentityService) {}

  async loginUser(loginCreds: LoginUserDto) {
    const { email, password } = loginCreds;

    const identityData = await this.identityService.getIdentityByEmail(email);

    if (!identityData) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.FORBIDDEN,
      );
    }

    const isPasswordMatched = await checkPassword(
      password,
      identityData.password,
    );

    if (!isPasswordMatched) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.FORBIDDEN,
      );
    }

    const passwordHash = await encryptPassword(password);
    const token = await generateJwtToken(email, passwordHash);
  }
}
