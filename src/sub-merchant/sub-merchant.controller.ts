import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { CreateSubMerchantDto } from './dto/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/update-sub-merchant.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { IdentityService } from 'src/identity/identity.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('sub-merchant')
export class SubMerchantController {
  constructor(
    private readonly subMerchantService: SubMerchantService,
    private identityService: IdentityService,
  ) {}

  @Get()
  findAll() {
    return this.subMerchantService.findAll();
  }

  @Get('profile/:id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.subMerchantService.getProfile(id);
  }

  @Get(':id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: number) {
    return this.subMerchantService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: number,
    @Body() updateSubMerchantDto: UpdateSubMerchantDto,
  ) {
    return this.subMerchantService.update(+id, updateSubMerchantDto);
  }

  @Delete(':id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: number) {
    return this.subMerchantService.remove(+id);
  }

  @Post(':merchantId/paginate')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  paginate(
    @Param('merchantId') id: number,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    return this.subMerchantService.paginate(id, paginateRequestDto);
  }

  @Post(':merchantId')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create(
    @Param('merchantId') id: number,
    @Body() createSubMerchantDto: CreateSubMerchantDto,
  ) {
    return this.subMerchantService.create(id, createSubMerchantDto);
  }

  @Post('change-password/:id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subMerchantService.changePassword(changePasswordDto, id);
  }
}
