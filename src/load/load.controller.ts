import { Controller, Post, HttpStatus, Get } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';

@Controller('load')
export class LoadController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  loadAll() {
    this.adminService.loadSuperAdmin();
    return HttpStatus.OK;
  }

  @Get()
  loadConfig() {}
}
