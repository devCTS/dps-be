import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { AdminRegisterDto, SignInDto } from './dto/admin.dto';
import {
  checkPassword,
  encryptPassword,
  generateJwtToken,
  paginate,
  verifyToken,
} from 'src/utils/utils';
import { superAdminData } from './data.admin';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // Register Admin
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

  // Sign in Admin
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

  // Get all admins
  async getAdminsList(token: string, page: number, limit: number) {
    const data = await verifyToken(token.split('=')[1]);
    const adminList = await this.adminRepository.find();
    return paginate(adminList, { page, limit });
  }

  // Get admin by User name
  async getAdminByUserName(user_name: string) {
    return await this.adminRepository.findOneBy({ user_name });
  }

  // Create Super Admin

  async createSuperAdmin() {
    const user_name = process.env.SUPER_ADMIN;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    const superAdmin = await this.getAdminByUserName(user_name);

    if (superAdmin) {
      throw new HttpException(
        'Admin already exists. Please login',
        HttpStatus.FORBIDDEN,
      );
    }

    const hashedPassword = await encryptPassword(password);
    await this.adminRepository.save({
      ...superAdminData,
      password: hashedPassword,
      user_name,
    });
    return { message: 'super admin created' };
  }
}
