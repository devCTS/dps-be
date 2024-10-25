import { Controller } from '@nestjs/common';
import { TransactionUpdatesPayinService } from './transaction-updates-payin.service';

@Controller('transaction-updates')
export class TransactionUpdatesController {
  constructor(
    private readonly transactionUpdatesPayinService: TransactionUpdatesPayinService,
  ) {}
}
