import { Controller } from '@nestjs/common';
import { ManualSettlementService } from './manual-settlement.service';

@Controller('manual-settlement')
export class ManualSettlementController {
  constructor(private manualSettlementService: ManualSettlementService) {}
}
