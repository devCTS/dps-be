import {
  Controller,
  Post,
  HttpStatus,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
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
      await this.sysConfigService.create();

      return HttpStatus.CREATED;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @Get('uniq')
  async uniqPayment() {
    const data = axios.post(
      process.env.UNIQ_PAY_API,
      {
        name: 'Abc',
        email: 'abc@abc.com ',
        phone: '1234567890',
        bankAccount: '123421232432278',
        ifsc: 'PUNB001001',
        address: '',
        amount: '200',
        custUniqRef: 'qwert',
        uniqpayId: 'qwert',
        txnPaymode: 'bank',
      },
      {
        headers: {
          'X-Upay-Client-Secret': process.env.UNIQ_PAY_SECRET,
          'X-Upay-Client-Id': process.env.UNIQ_PAY_CLIENT_ID,
        },
      },
    );

    console.log(data);
  }
}
