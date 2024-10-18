import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  @Type(() => UpiDto)
  @ValidateNested({ each: true })
  upi: UpiDto[] | null;

  @Type(() => NetBankingDto)
  @ValidateNested({ each: true })
  netBanking: NetBankingDto[] | null;

  @Type(() => EWalletDto)
  @ValidateNested({ each: true })
  eWallet: EWalletDto[] | null;
}
