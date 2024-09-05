import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './identity.entity';
import { Repository } from 'typeorm';
import {
  IdentityRegisterDto,
  IdentitySigninDto,
  UpdatePasswordDto,
} from './dto/identity.dto';
import {
  checkPassword,
  encryptPassword,
  generateJwtToken,
} from 'src/utils/utils';

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

  // Reset password
  async resetPassword(updatePasswordData: UpdatePasswordDto) {
    const { user_name, oldPassword, newPassword } = updatePasswordData;

    const identity = await this.getIdentityByUserName(user_name);
    if (!identity) {
      throw new NotFoundException('User does not exists.');
    }

    const oldHashedPassword = await encryptPassword(oldPassword);
    const isPasswordMatched = checkPassword(oldPassword, oldHashedPassword);

    if (!isPasswordMatched) {
      throw new ForbiddenException('Invalid credentials.');
    }

    const newHashedPassword = await encryptPassword(newPassword);
    await this.identityRepository.update(identity.id, {
      ...identity,
      password: newHashedPassword,
    });

    return { message: 'Password changed' };
  }
}
