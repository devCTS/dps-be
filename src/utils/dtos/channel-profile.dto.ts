import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
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
