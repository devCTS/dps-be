import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Gateway } from '../enums/gateways';
import { PayinMode } from '../enums/misc';
import { Type } from 'class-transformer';

class RangeDto {
  @IsNumber()
  lower: number;

  @IsNumber()
  upper: number;

  @IsEnum(Gateway)
  gateway: Gateway;
}

class RatioDto {
  @IsNumber()
  ratio: number;

  @IsEnum(Gateway)
  gateway: Gateway;
}

export class PayinModeDetailsDto {
  @IsEnum(PayinMode)
  type: PayinMode;

  @IsNumber()
  entries: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RangeDto)
  ranges: RangeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatioDto)
  ratios: RatioDto[];
}
