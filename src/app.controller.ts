import { Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { PayuService } from './payment-system/payu/payu.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly payuService: PayuService,
  ) {}

  @Get()
  async getHello() {}

  @Get('payu-token')
  async generatePayuAccessToken() {
    return await this.payuService.getAccessToken('live');
  }
}
