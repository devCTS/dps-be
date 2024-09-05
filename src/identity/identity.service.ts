import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './identity.entity';
import { Repository } from 'typeorm';
import { IdentityRegisterDto, IdentitySigninDto } from './dto/identity.dto';
import { checkPassword, generateJwtToken } from 'src/utils/utils';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {}

  // Get identity by user name
  async getIdentityByUserName(user_name: string) {
    return await this.identityRepository.findOneBy({ user_name });
  }

  // Register identity
  async registerIdentity(registerIdentityData: IdentityRegisterDto) {
    return this.identityRepository.save(registerIdentityData);
  }

  // Sign in
  async signIn(signinData: IdentitySigninDto) {
    const { user_name, password } = signinData;

    const identity = await this.getIdentityByUserName(user_name);
    if (!identity) {
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    const hashedPassword = signinData.password;

    const isPasswordMatched = checkPassword(password, hashedPassword);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('User name or pawword is incorrect');
    }

    return generateJwtToken({ user_name, hashedPassword });
  }
}
