import { IsEnum, IsNumber } from 'class-validator';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

export class CreateSettlementDto {
  @IsNumber()
  identityId: number;

  @IsNumber()
  amount: number;

  @IsEnum({ enum: ['INCREMENT', 'DECREMENT'] })
  operation: 'INCREMENT' | 'DECREMENT';

  @IsEnum(UserTypeForTransactionUpdates)
  balanceType: UserTypeForTransactionUpdates;
}

export class CreateFundRecordDto {}
