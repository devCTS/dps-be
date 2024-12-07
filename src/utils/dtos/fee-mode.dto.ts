import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { FeeMode } from '../enums/fee-mode';

export class FeeModeDetailsDto {
  @IsEnum(FeeMode)
  mode: FeeMode;

  @IsOptional()
  @IsNumber()
  absoluteAmount?: number;

  @IsOptional()
  @IsNumber()
  percentageAmount?: number;
}
