import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AlertReadStatus, Users } from 'src/utils/enum/enum';

export class AlertCreateDto {
  @IsNotEmpty()
  @IsNumber()
  for: number;

  @IsNotEmpty()
  @IsEnum(Users)
  userType: Users;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsEnum(AlertReadStatus)
  status: AlertReadStatus;

  @IsOptional()
  @IsObject()
  data: any;
}
