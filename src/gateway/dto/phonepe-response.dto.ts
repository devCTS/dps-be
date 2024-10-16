import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

@Exclude()
export class PhonepeResponseDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  incoming: boolean;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  outgoing: boolean;
}
