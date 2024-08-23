import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantRegistrationDto } from './dto/merchant.dto';
import { Response } from 'express';

@Controller('merchant')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Post('register')
  async registerMerchant(
    @Body() registrationDetails: MerchantRegistrationDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt =
      await this.merchantService.registerMerchant(registrationDetails);
    response.cookie('merchant_token', jwt);
    return {
      token: jwt,
      message: 'merchant added',
      status: HttpStatus.CREATED,
    };
  }
}
