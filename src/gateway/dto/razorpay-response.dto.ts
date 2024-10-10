import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class RazorpayResponseDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  incoming: boolean;

  @IsBoolean()
  @IsNotEmpty()
  outgoing: boolean;
}
