import { PayoutAdminService } from './../payout/payout-admin.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { IdentityService } from 'src/identity/identity.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { PayoutService } from 'src/payout/payout.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private identityService: IdentityService,
    private readonly payoutAdminService: PayoutAdminService,
  ) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get('profile/:id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getProfile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.adminService.paginate(paginateRequestDto);
  }

  @Post('change-password/:id')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.changePassword(changePasswordDto, id);
  }

  @Post('payouts/paginate')
  paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutAdminService.paginate(paginateRequestDto);
  }

  @Post('pending-payouts/paginate')
  paginatePendingPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutAdminService.paginate(paginateRequestDto, true);
  }

  @Get('payout/:id')
  getPayoutDetails(@Param('id') id: string) {
    return this.payoutAdminService.getPayoutDetails(id);
  }
}
