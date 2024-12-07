import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GatewaySettingsService } from './gateway.service';

@Controller('gateway')
export class GatewaySettingsController {
  constructor(private readonly service: GatewaySettingsService) {}

  @Get()
  getAllGateways() {
    return this.service.getAllGateways();
  }

  @Get('razorpay')
  getRazorPayChannelSettings() {
    return this.service.getRazorPayChannelSettings();
  }

  @Get('phonepe')
  getPhonePeChannelSettings() {
    return this.service.getPhonePeChannelSettings();
  }

  @Patch('razorpay')
  updateRazorPay(@Body() body: any) {
    return this.service.updateRazorPay(body);
  }

  @Patch('phonepe')
  updatePhonePe(@Body() body: any) {
    return this.service.updatePhonePe(body);
  }
}
