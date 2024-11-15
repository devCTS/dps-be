import { Controller } from '@nestjs/common';
import { FundRecordService } from './fund-record.service';

@Controller('fund-record')
export class FundRecordController {
  constructor(private readonly fundRecordService: FundRecordService) {}
}
