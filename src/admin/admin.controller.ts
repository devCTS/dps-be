import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AdminRegisterDto, SignInDto } from './dto/admin.dto';
import { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('register')
  async registerAdmin(
    @Body() adminRegistrationDetails: AdminRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.adminService.registerAdmin(adminRegistrationDetails);
    response.cookie('admin_token', jwt);
    return {
      message: 'Admin registered',
      status: HttpStatus.CREATED,
    };
  }

  @Post('sign-in')
  async signInAdmin(
    @Body() signinAdminDetails: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.adminService.signInAdmin(signinAdminDetails);
    response.cookie('admin_token', jwt);
    return {
      message: 'Admin Logged in',
      status: HttpStatus.OK,
    };
  }
}
