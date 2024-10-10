import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  CreateRazorpayDto,
  UpdateRazorpayDto,
} from './dto/create-razorpay.dto';
import { GatewayService } from './gateway.service';
import { CreatePhonepeDto, UpdatePhonepDto } from './dto/create-phonepe.dto';
import {
  CreateChannelSettingsDto,
  UpdateChannelSettingsDto,
} from './dto/create-channel-settings.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @Post('razorpay/create')
  CreateRazorpay(@Body() createRazorpayDto: CreateRazorpayDto) {
    return this.gatewayService.createRazorPay(createRazorpayDto);
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
  createPhonepe(@Body() createPhonepeDto: CreatePhonepeDto) {
    return this.gatewayService.createPhonepe(createPhonepeDto);
  }

  @Get('phonepe')
  getPhonepeConfig() {
    return this.gatewayService.getPhonepe();
  }

  @Post('phonepe/update')
  updatePhonepe(@Body() updatePhonepeDto: UpdatePhonepDto) {
    return this.gatewayService.updatePhonepe(updatePhonepeDto);
  }

  @Post('channel-setting/create')
  createChannelSettings(
    @Body() createChannelSettingsDto: CreateChannelSettingsDto,
  ) {
    return this.gatewayService.createChannelSettings(createChannelSettingsDto);
  }

  @Post('channel-setting/update/:id')
  updateChannelSettings(
    @Body() updateChannelSettingsDto: UpdateChannelSettingsDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.gatewayService.updateChannelSettings(
      id,
      updateChannelSettingsDto,
    );
  }
}
