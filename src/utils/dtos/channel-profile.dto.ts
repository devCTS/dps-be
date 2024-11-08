import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

  @IsOptional()
  @IsBoolean()
  isBusinessUpi: boolean;

  @IsOptional()
  @IsNumber()
  channelIndex: number;
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

  @IsOptional()
  @IsNumber()
  channelIndex: number;
}

export class EWalletDto {
  @IsNotEmpty()
  @IsString()
  app: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsNumber()
  channelIndex: number;
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
