import {
  Controller,
  Post,
  HttpStatus,
  Get,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { ChannelService } from 'src/channel/channel.service';
import { GatewayService } from 'src/gateway/gateway.service';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Controller('load')
export class LoadController {
  constructor(
    private readonly adminService: AdminService,
    private readonly channelService: ChannelService,
    private readonly gatewaysService: GatewayService,
    private readonly sysConfigService: SystemConfigService,
  ) {}

  @Post()
  async loadAll() {
    try {
      await this.adminService.loadSuperAdmin();
      await this.channelService.createChannelConfig();
      await this.gatewaysService.createChannelSettings();
      await this.gatewaysService.createPhonepe();
      await this.gatewaysService.createRazorPay();
      await this.gatewaysService.createUniqpay();
      await this.sysConfigService.create();

      return HttpStatus.CREATED;
    } catch (error) {
      console.log({ error });
      throw new NotAcceptableException();
    }
  }
}
