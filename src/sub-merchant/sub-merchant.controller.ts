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
import { CreateSubMerchantDto } from './dto/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/update-sub-merchant.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('sub-merchant')
export class SubMerchantController {
  constructor(private readonly subMerchantService: SubMerchantService) {}

  @Get()
  findAll() {
    return this.subMerchantService.findAll();
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

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.subMerchantService.paginate(paginateRequestDto);
  }

  @Post(':merchantId')
  create(
    @Param() id: number,
    @Body() createSubMerchantDto: CreateSubMerchantDto,
  ) {
    return this.subMerchantService.create(id, createSubMerchantDto);
  }
}
