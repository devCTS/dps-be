import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyWithdrawalPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
