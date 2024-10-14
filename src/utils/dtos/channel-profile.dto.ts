import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FilledFieldDto {
  @IsNumber()
  @IsNotEmpty()
  fieldId: number;

  @IsString()
  value: string;
}

export class UpiDto {
  @IsNotEmpty()
  @IsString()
  upiId: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;
}

export class NetBankingDto {
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  beneficiaryName: string;

  @IsNotEmpty()
  @IsString()
  ifsc: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;
}

export class EWalletDto {
  @IsNotEmpty()
  @IsString()
  app: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;
}

export class ChannelProfileDto {
  upi: UpiDto | null;
  netBanking: NetBankingDto | null;
  eWallet: EWalletDto | null;
}
