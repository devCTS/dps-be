import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { AdminRegisterDto, SignInDto } from './dto/admin.dto';
import {
  checkPassword,
  encryptPassword,
  generateJwtToken,
} from 'src/utils/utils';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async getAdminByUserName(user_name: string) {
    return await this.adminRepository.findOneBy({ user_name });
  }

  async registerAdmin(adminRegistrationDetails: AdminRegisterDto) {
    const { password, user_name, email } = adminRegistrationDetails;

    const isAdminExists = await this.getAdminByUserName(user_name);

    if (isAdminExists) {
      throw new HttpException(
        'Admin already exists. Please Sign in.',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await encryptPassword(password);
    const jwtToken = await generateJwtToken(email, hashedPassword);

    await this.adminRepository.save({
      ...adminRegistrationDetails,
      password: hashedPassword,
    });

    return jwtToken;
  }

  async signInAdmin(signinAdminDetails: SignInDto) {
    const { user_name, password } = signinAdminDetails;
    const adminData = await this.getAdminByUserName(user_name);

    if (!adminData) {
      throw new HttpException(
        'User name or password is incorrect',
        HttpStatus.FORBIDDEN,
      );
    }

    const isPasswordMatched = await checkPassword(password, adminData.password);

    if (!isPasswordMatched) {
      throw new HttpException(
        'User name or password is incorrect',
        HttpStatus.FORBIDDEN,
      );
    }

    const jwttoken = await generateJwtToken(adminData.email, password);

    return jwttoken;
  }
}
