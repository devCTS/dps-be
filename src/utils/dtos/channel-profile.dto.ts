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

// DTO for the ChannelProfileField with the filled fields array
export class ChannelProfileDto {
  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilledFieldDto)
  profileFields: FilledFieldDto[];
}

export class ChannelProfileDto2 {
  upi: { upi_id: string; mobile: string } | null;
  net_banking: {
    bank_name: string;
  } | null;
  e_wallet: any;
}

// either a key should have all the necessary fields or completly null or undefined.
// User can send any combination of field and blank keys for channels.
