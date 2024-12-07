import {
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpiDto {
  @IsString()
  upiId: string;

  @IsString()
  mobile: string;

  @IsBoolean()
  isBusinessUpi: boolean;
}

class NetbankingDto {
  @IsString()
  accountNumber: string;

  @IsString()
  ifsc: string;

  @IsString()
  bankName: string;

  @IsString()
  beneficiaryName: string;
}

class EWalletDto {
  @IsString()
  app: string;

  @IsString()
  mobile: string;
}

export class ChannelProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpiDto)
  upi: UpiDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => NetbankingDto)
  netbanking: NetbankingDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => EWalletDto)
  eWallet: EWalletDto | null;
}
