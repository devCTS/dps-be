import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCurrencyDto {
  @IsNotEmpty()
  @IsString()
  currency: string;
}
