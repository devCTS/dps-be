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
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { Repository } from 'typeorm';
import { Submerchant } from './entities/sub-merchant.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('sub-merchant')
export class SubMerchantController {
  constructor(
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,
    private readonly subMerchantService: SubMerchantService,
    private identityService: IdentityService,
  ) {}

  // @Get()
  // findAll() {
  //   return this.subMerchantService.findAll();
  // }

  // @Get('profile/:id')
  // @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  // @UseGuards(RolesGuard)
  // getProfile(@Param('id', ParseIntPipe) id: number) {
  //   return this.subMerchantService.getProfile(id);
  // }

  @Get()
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  findOne(@UserInReq() user) {
    return this.subMerchantService.findOne(user.id);
  }

  @Patch(':id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateSubMerchantDto: UpdateSubMerchantDto,
  ) {
    return this.subMerchantService.update(id, updateSubMerchantDto);
  }

  @Delete(':id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.subMerchantService.remove(id);
  }

  @Post('paginate')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async paginate(
    @UserInReq() user,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.subMerchantService.paginate(+merchantId, paginateRequestDto);
  }

  @Post(':merchantId')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create(
    @Param('merchantId') id: string,
    @Body() createSubMerchantDto: CreateSubMerchantDto,
  ) {
    return this.subMerchantService.create(id, createSubMerchantDto);
  }

  @Post('change-password/:id')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: string,
  ) {
    return this.subMerchantService.changePassword(changePasswordDto, id);
  }
}
