import { Body, Controller, Post } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantRegistrationDto } from './dto/merchant.dto';

@Controller('merchant')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Post('register')
  registerMerchant(@Body() registrationDetails: MerchantRegistrationDto) {
    return registrationDetails;
  }
}
