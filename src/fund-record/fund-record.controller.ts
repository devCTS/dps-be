import { Body, Controller, Post } from '@nestjs/common';
import { FundRecordService } from './fund-record.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('fund-record')
export class FundRecordController {
  constructor(private readonly fundRecordService: FundRecordService) {}

  @Post('/paginate')
  async paginateFundRecords(@Body() paginateRequestBody: PaginateRequestDto) {
    return await this.fundRecordService.paginateFundRecords(
      paginateRequestBody,
    );
  }
}
