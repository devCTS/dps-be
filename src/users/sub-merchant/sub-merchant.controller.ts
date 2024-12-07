import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';

import { IdentityService } from '../identity/identity.service';
import { CreateSubMerchantDto } from './dto/request/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/request/update-sub-merchant.dto';

@Controller('sub-merchant')
export class SubMerchantController {
  constructor(
    private readonly service: SubMerchantService,
    private readonly identityService: IdentityService,
  ) {}

  @Post()
  create(@Body() createSubMerchantDto: CreateSubMerchantDto) {
    return this.service.create(createSubMerchantDto);
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
    @Body() updateSubMerchantDto: UpdateSubMerchantDto,
  ) {
    return this.service.update(id, updateSubMerchantDto);
  }
}
