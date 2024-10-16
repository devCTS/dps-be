import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';

export class WithdrawalDefaultsDto {
  @IsNumber()
  withdrawalRate: number;

  @IsNumber()
  maxWithdrawalAmount: number;

  @IsNumber()
  minWithdrawalAmount: number;
}

export class UpdateWithdrawalDefaultsDto extends PartialType(
  WithdrawalDefaultsDto,
) {}
