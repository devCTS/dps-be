import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AssignTopupOrderDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  memberId: string;
}
