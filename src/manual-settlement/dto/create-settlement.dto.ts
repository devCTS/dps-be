import { IsEnum, IsNumber } from 'class-validator';

export class CreateSettlementDto {
  @IsNumber()
  identityId: number;

  @IsNumber()
  amount: number;

  @IsEnum({ enum: ['INCREMENT', 'DECREMENT'] })
  operation: 'INCREMENT' | 'DECREMENT';
}
