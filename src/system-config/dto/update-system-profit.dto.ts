import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateSystemProfitDto {
  @IsNotEmpty()
  @IsNumber()
  payinSystemProfitRate: number;

  @IsNotEmpty()
  @IsNumber()
  payoutSystemProfitRate: number;
}
