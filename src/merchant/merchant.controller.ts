import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantRegisterDto, MerchantUpdateDto } from './dto/merchant.dt';

@Controller('merchant')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  // POST requests
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

  // GET Reuqests
  @Get('/:user_name')
  async getUserByUserName(@Param('user_name') user_name: string) {
    return this.merchantService.getMerchantByUserName(user_name);
  }

  @Get()
  async getAllMerchants() {
    return this.merchantService.getAllMerchants();
  }
}
