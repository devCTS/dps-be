import { IsEnum, IsNumber, IsString } from 'class-validator';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

export class CreateSettlementDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  operation: string;

  @IsEnum(UserTypeForTransactionUpdates)
  balanceType: UserTypeForTransactionUpdates;
}

export class MemberSettlementDto {
  @IsString()
  sendingMemberId: string;

  @IsNumber()
  amount: number;

  @IsString()
  receivingMemberEmail: string;
}

export class CreateFundRecordDto {}
