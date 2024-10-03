import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateExportDto } from './dto/create-export.dto';
import { AdminService } from 'src/admin/admin.service';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { SubMerchantService } from 'src/sub-merchant/sub-merchant.service';
import { AgentService } from 'src/agent/agent.service';

@Injectable()
export class ExportService {
  constructor(
    private readonly adminService: AdminService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly subMerchantService: SubMerchantService,
    private readonly agentService: AgentService,
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

      case 'agent':
        return await this.agentService.exportRecords(startDate, endDate);

      default:
        throw new NotAcceptableException('Invalid table name!');
    }
  }
}
