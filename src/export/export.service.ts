import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExportDto } from './dto/create-export.dto';
import { ChannelService } from 'src/channel/channel.service';
import { AdminService } from 'src/admin/admin.service';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { SubMerchantService } from 'src/sub-merchant/sub-merchant.service';

@Injectable()
export class ExportService {
  constructor(
    private readonly adminService: AdminService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly subMerchantService: SubMerchantService,
    private readonly channelService: ChannelService,
  ) {}

  async create(createExportDto: CreateExportDto) {
    const { startDate, endDate, tableName } = createExportDto;

    switch (tableName) {
      case 'admin':
        return await this.adminService.exportRecords(startDate, endDate);
      case 'member':
        return await this.memberService.exportRecords(startDate, endDate);
      case 'merchant':
        return await this.merchantService.exportRecords(startDate, endDate);
      case 'submerchant':
        return await this.subMerchantService.exportRecords(startDate, endDate);
      case 'channel':
        return await this.channelService.exportRecords(startDate, endDate);

      default:
        throw new NotFoundException();
    }
  }
}