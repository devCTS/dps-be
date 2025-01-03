import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UpdateRazorpayDto } from './dto/create-razorpay.dto';
import { GatewayService } from './gateway.service';
import { UpdatePhonepDto } from './dto/create-phonepe.dto';
import { UpdateChannelSettingsDto } from './dto/create-channel-settings.dto';
import { GetChannelSettingsDto } from './dto/get-channel-settings.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { UpdateUniqpayDto } from './dto/create-uniqpay.dto';

@Controller('gateway')
@UseGuards(RolesGuard)
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @Post('razorpay/create')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  CreateRazorpay() {
    return this.gatewayService.createRazorPay();
  }

  @Get('razorpay')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  getRazorpayConfig() {
    return this.gatewayService.getRazorpay();
  }

  @Post('razorpay/update')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  UpdateRazorpay(@Body() updateRazorpayDto: UpdateRazorpayDto) {
    return this.gatewayService.updateRazorpay(updateRazorpayDto);
  }

  @Post('phonepe/create')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  createPhonepe() {
    return this.gatewayService.createPhonepe();
  }

  @Get('phonepe')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  getPhonepeConfig() {
    return this.gatewayService.getPhonepe();
  }

  @Post('phonepe/update')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  updatePhonepe(@Body() updatePhonepeDto: UpdatePhonepDto) {
    return this.gatewayService.updatePhonepe(updatePhonepeDto);
  }

  @Post('uniqpay/create')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  CreateUniqpay() {
    return this.gatewayService.createUniqpay();
  }

  @Get('uniqpay')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  getUniqpayConfig() {
    return this.gatewayService.getUniqpay();
  }

  @Post('uniqppay/update')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  UpdateUniqpay(@Body() updateUniqpayDto: UpdateUniqpayDto) {
    return this.gatewayService.updateUniqpay(updateUniqpayDto);
  }

  @Get('channel-settings/all')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  getAllChannelSettings() {
    return this.gatewayService.getAllChannelsSetting();
  }

  @Post('channel-settings')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  getChannelSettings(@Body() getChannelsettingsDto: GetChannelSettingsDto) {
    return this.gatewayService.getChannelSettings(getChannelsettingsDto);
  }

  @Post('channel-setting/create')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  createChannelSettings() {
    return this.gatewayService.createChannelSettings();
  }

  @Patch('channel-setting/update')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  updateChannelSettings(
    @Body() updateChannelSettingsDto: UpdateChannelSettingsDto,
  ) {
    return this.gatewayService.updateChannelSettings(updateChannelSettingsDto);
  }
}
