import { PayoutAdminService } from './../payout/payout-admin.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { IdentityService } from 'src/identity/identity.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private identityService: IdentityService,
    private readonly payoutAdminService: PayoutAdminService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  create(@Body() createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    return this.adminService.create(createAdminDto);
  }

  // @Get()
  // findAll() {
  //   return this.adminService.findAll();
  // }

  // @Get('profile/:id')
  // getProfile(@Param('id', ParseIntPipe) id: number) {
  //   return this.adminService.getProfile(id);
  // }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  findOne(@UserInReq() user) {
    return this.adminService.findOne(+user.id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  findOneAdmin(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.adminService.paginate(paginateRequestDto);
  }

  @Post('change-password')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserInReq() user,
  ) {
    return this.adminService.changePassword(changePasswordDto, +user.id);
  }

  // @Post('payouts/paginate')
  // paginatePayouts(@Body() paginateRequestDto: PaginateRequestDto) {
  //   return this.payoutAdminService.paginate(paginateRequestDto);
  // }

  // @Post('pending-payouts/paginate')
  // paginatePendingPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
  //   return this.payoutAdminService.paginate(paginateRequestDto, true);
  // }

  // @Get('payout/:id')
  // getPayoutDetails(@Param('id') id: string) {
  //   return this.payoutAdminService.getPayoutDetails(id);
  // }
}
