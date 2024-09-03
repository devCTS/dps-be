import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminRegisterDto, SignInDto } from './dto/admin.dto';
import { Response, Request } from 'express';
import { AdminService } from './admin.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('register')
  async registerAdmin(
    @Body() adminRegistrationDetails: AdminRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(adminRegistrationDetails);
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

  @Get('super-admin')
  async createSuperAdmin() {
    return this.adminService.createSuperAdmin();
  }

  @Get('/:page/:perpage')
  @UseGuards(new AuthenticationGuard())
  async getAdminList(
    @Req() request: Request,
    @Param('perpage') perPage?: number,
    @Param('page') page?: number,
  ) {
    const clientToken = request.headers.cookie;
    console.log();
    return this.adminService.getAdminsList(clientToken, page, perPage);
  }
}
