import {
  Controller,
  Post,
  HttpStatus,
  Get,
  InternalServerErrorException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { ChannelService } from 'src/channel/channel.service';
import { GatewayService } from 'src/gateway/gateway.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import * as nodemailer from 'nodemailer';

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

  @Get('mail')
  sendMail() {
    let transporter = nodemailer.createTransport({
      host: 'gottabarter.com',
      port: 587,
      secure: false,
      auth: {
        user: `"Maddison Foo Koch 👻" <no-reply@gottabarter.com>`,
        pass: 'G0ttaBarter',
      },
    });

    let mailOptions = {
      from: 'no-reply@gottabarter.com',
      to: 'naheg46162@ronete.com',
      subject: 'Something',
      text: 'Something text',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        // throw new BadRequestException('abc');
      } else {
        console.log(info);
        return 'abc';
      }
    });
  }
}
