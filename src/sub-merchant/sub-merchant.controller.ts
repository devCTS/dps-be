import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { CreateSubMerchantDto } from './dto/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/update-sub-merchant.dto';

@Controller('sub-merchant')
export class SubMerchantController {
  constructor(private readonly subMerchantService: SubMerchantService) {}

  @Post()
  create(@Body() createSubMerchantDto: CreateSubMerchantDto) {
    return this.subMerchantService.create(createSubMerchantDto);
  }

  @Get()
  findAll() {
    return this.subMerchantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subMerchantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubMerchantDto: UpdateSubMerchantDto) {
    return this.subMerchantService.update(+id, updateSubMerchantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subMerchantService.remove(+id);
  }
}
