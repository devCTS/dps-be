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

export class ChannelProfileDto {
  upi: { upi_id: string; mobile: string } | null;
  net_banking: {
    bank_name: string;
  } | null;
  e_wallet: {
    app: string;
    mobile: string;
  } | null;
}
