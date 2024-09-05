import { Body, Controller, Param, Patch, Post, Res } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import {
  MerchantRegisterDto,
  MerchantSigninDto,
  MerchantUpdateDto,
} from './dto/merchant.dt';
import { Response } from 'express';

@Controller('merchant')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Post('register')
  async registerMerchant(@Body() merchantRegisterData: MerchantRegisterDto) {
    return this.merchantService.registerMerchant(merchantRegisterData);
  }

  @Patch('/:user_name')
  async updateMerchant(
    @Param('user_name') user_name: string,
    @Body() merchantUpdateData: MerchantUpdateDto,
  ) {
    return await this.merchantService.updateMerchantDetails(
      merchantUpdateData,
      user_name,
    );
  }
}
