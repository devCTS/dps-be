import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRegisterDto, AdminUpdateDto } from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // POST requests
  @Post('register')
  async registerAdmin(@Body() adminRegisterData: AdminRegisterDto) {
    return this.adminService.registerAdmin(adminRegisterData);
  }

  @Patch('/:user_name')
  async updateAdmin(
    @Param('user_name') user_name: string,
    @Body() adminUpdateData: AdminUpdateDto,
  ) {
    return await this.adminService.updateAdminDetails(
      adminUpdateData,
      user_name,
    );
  }

  // GET Reuqests
  @Get('/:user_name')
  async getUserByUserName(@Param('user_name') user_name: string) {
    return this.adminService.getAdminByUserName(user_name);
  }

  @Get()
  async getAllAdmin() {
    return this.adminService.getAllAdmins();
  }

  // DELETE Requets
  @Delete()
  async deleteAllAdmin() {
    return await this.adminService.deleteAllAdmins();
  }

  @Delete('/:user_name')
  async deleteAdmin(@Param('user_name') user_name: string) {
    return await this.adminService.deleteOneAdmin(user_name);
  }
}
