import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, Min } from 'class-validator';

export class WithdrawalDefaultsDto {
  @IsNumber()
  withdrawalRate: number;

  @IsNumber()
  maxWithdrawalAmount: number;

  @IsNumber()
  minWithdrawalAmount: number;

  @IsNumber()
  @Min(1)
  frozenAmountThreshold: number;
}

export class UpdateWithdrawalDefaultsDto extends PartialType(
  WithdrawalDefaultsDto,
) {}
