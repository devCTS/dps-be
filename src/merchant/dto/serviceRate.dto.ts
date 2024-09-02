import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class ServiceRateDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsEnum(['percent', 'absolute'])
  @IsNotEmpty()
  type: string;
}
