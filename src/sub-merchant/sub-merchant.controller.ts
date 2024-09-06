import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import {
  SubMerchantRegisterDto,
  SubMerchantUpdateDto,
} from './dto/sub-merchant.dto';

@Controller('sub-merchant')
export class SubMerchantController {
  constructor(private subMerchantService: SubMerchantService) {}

  // POST requests
  @Post('register')
  async registerSubMerchant(
    @Body() subMerchantRegisterData: SubMerchantRegisterDto,
  ) {
    return this.subMerchantService.registerSubMerchant(subMerchantRegisterData);
  }

  @Patch('/:user_name')
  async updateSubMerchant(
    @Param('user_name') user_name: string,
    @Body() subMerchantUpdateData: SubMerchantUpdateDto,
  ) {
    return await this.subMerchantService.updateSubMerchantDetails(
      subMerchantUpdateData,
      user_name,
    );
  }

  // GET Reuqests
  @Get('/:user_name')
  async getUserByUserName(@Param('user_name') user_name: string) {
    return this.subMerchantService.getSubMerchantByUserName(user_name);
  }

  @Get()
  async getAllSubMerchants() {
    return this.subMerchantService.getAllSubMerchants();
  }

  // DELETE Requets
  @Delete()
  async deleteAllSubMerchants() {
    return await this.subMerchantService.deleteAllSubMerchants();
  }
  @Delete('/:user_name')
  async deleteSubMerchant(@Param('user_name') user_name: string) {
    return await this.subMerchantService.deleteOneSubMerchant(user_name);
  }
}
