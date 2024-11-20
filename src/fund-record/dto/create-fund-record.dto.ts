import { IsEnum, IsNumber, IsString } from 'class-validator';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

export class CreateSettlementDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  amount: number;

  @IsString()
  operation: string;

  @IsEnum(UserTypeForTransactionUpdates)
  balanceType: UserTypeForTransactionUpdates;
}

export class MemberSettlementDto {
  @IsNumber()
  sendingMemberId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  receivingMemberEmail: string;
}

export class CreateFundRecordDto {}
