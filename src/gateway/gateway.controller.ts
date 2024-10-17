import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UpdateRazorpayDto } from './dto/create-razorpay.dto';
import { GatewayService } from './gateway.service';
import { UpdatePhonepDto } from './dto/create-phonepe.dto';
import { UpdateChannelSettingsDto } from './dto/create-channel-settings.dto';
import { GetChannelSettingsDto } from './dto/get-channel-settings.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @Post('razorpay/create')
  CreateRazorpay() {
    return this.gatewayService.createRazorPay();
  }

  @Get('razorpay')
  getRazorpayConfig() {
    return this.gatewayService.getRazorpay();
  }

  @Post('razorpay/update')
  UpdateRazorpay(@Body() updateRazorpayDto: UpdateRazorpayDto) {
    return this.gatewayService.updateRazorpay(updateRazorpayDto);
  }

  @Post('phonepe/create')
  createPhonepe() {
    return this.gatewayService.createPhonepe();
  }

  @Get('phonepe')
  getPhonepeConfig() {
    return this.gatewayService.getPhonepe();
  }

  @Post('phonepe/update')
  updatePhonepe(@Body() updatePhonepeDto: UpdatePhonepDto) {
    return this.gatewayService.updatePhonepe(updatePhonepeDto);
  }

  @Get('channel-settings/all')
  getAllChannelSettings() {
    return this.gatewayService.getAllChannelsSetting();
  }

  @Post('channel-settings')
  getChannelSettings(@Body() getChannelsettingsDto: GetChannelSettingsDto) {
    return this.gatewayService.getChannelSettings(getChannelsettingsDto);
  }

  @Post('channel-setting/create')
  createChannelSettings() {
    return this.gatewayService.createChannelSettings();
  }

  @Patch('channel-setting/update')
  updateChannelSettings(
    @Body() updateChannelSettingsDto: UpdateChannelSettingsDto,
  ) {
    return this.gatewayService.updateChannelSettings(updateChannelSettingsDto);
  }
}
