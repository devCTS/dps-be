import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class PhonepeResponseDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  incoming: boolean;

  @IsBoolean()
  @IsNotEmpty()
  outgoing: boolean;
}
