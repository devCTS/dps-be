import { IsNumber } from 'class-validator';

export class PayoutLimitDto {
  @IsNumber()
  upper: number;

  @IsNumber()
  lower: number;
}
