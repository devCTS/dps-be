import { IsBoolean, IsNotEmpty } from 'class-validator';

export class RazorpayResponseDto {
  @IsBoolean()
  @IsNotEmpty()
  incoming: boolean;

  @IsBoolean()
  @IsNotEmpty()
  outgoing: boolean;
}
