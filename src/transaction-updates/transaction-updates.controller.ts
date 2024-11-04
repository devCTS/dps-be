import { Body, Controller, Post } from '@nestjs/common';
import { TransactionUpdatesService } from './transaction-updates.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('transaction-updates')
export class TransactionUpdatesController {
  constructor(
    private readonly transactionUpdatesService: TransactionUpdatesService,
  ) {}

  @Post('commissions/paginate')
  allCommissions(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.transactionUpdatesService.paginateCommissionsAndProfits(
      paginateRequestDto,
    );
  }
}
