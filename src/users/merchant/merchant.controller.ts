import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';

import { IdentityService } from '../identity/identity.service';
import { UpdateMerchantDto } from './dto/request/update-merchant.dto';
import { CreateMerchantDto } from './dto/request/create-merchant.dto';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly service: MerchantService,
    private readonly identityService: IdentityService,
  ) {}

  @Post()
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.service.create(createMerchantDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.identityService.getUserDetails(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.service.update(id, updateMerchantDto);
  }
}
