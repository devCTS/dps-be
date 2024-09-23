import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { CreateSubMerchantDto } from './dto/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/update-sub-merchant.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { IdentityService } from 'src/identity/identity.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';

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
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.subMerchantService.getProfile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.subMerchantService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateSubMerchantDto: UpdateSubMerchantDto,
  ) {
    return this.subMerchantService.update(+id, updateSubMerchantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.subMerchantService.remove(+id);
  }

  @Post(':merchantId/paginate')
  paginate(
    @Param('merchantId') id: number,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    return this.subMerchantService.paginate(id, paginateRequestDto);
  }

  @Post(':merchantId')
  create(
    @Param('merchantId') id: number,
    @Body() createSubMerchantDto: CreateSubMerchantDto,
  ) {
    return this.subMerchantService.create(id, createSubMerchantDto);
  }

  @Post('change-password/:id')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.identityService.changePassword(changePasswordDto, id);
  }
}
