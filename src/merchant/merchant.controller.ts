import { Body, Controller, Post, Res } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantRegisterDto, MerchantSigninDto } from './dto/merchant.dt';
import { Response } from 'express';

@Controller('merchant')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Post('register')
  async registerMerchant(@Body() merchantRegisterData: MerchantRegisterDto) {
    return this.merchantService.registerMerchant(merchantRegisterData);
  }

  @Post('sign-in')
  async signInMerchant(
    @Body() merchantSigninData: MerchantSigninDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.merchantService.signInMerchant(merchantSigninData);
    response.cookie('merchant_token', `Bearer_${jwt}`);
    return { message: 'Sign in successful.', merchantSigninData };
  }
}
