import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateTeamCommissionsDto {
  @IsNotEmpty()
  @IsNumber()
  teamPayinCommissionRate: number;

  @IsNotEmpty()
  @IsNumber()
  teamPayoutCommissionRate: number;

  @IsNotEmpty()
  @IsNumber()
  teamTopupCommissionRate: number;
}
