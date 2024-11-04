import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyWithdrawalPasswordDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}
