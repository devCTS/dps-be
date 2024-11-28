import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AlertReadStatus, AlertType, Users } from 'src/utils/enum/enum';

export class AlertCreateDto {
  @IsNotEmpty()
  @IsString()
  for: string;

  @IsNotEmpty()
  @IsEnum(Users)
  userType: Users;

  @IsOptional()
  @IsEnum(AlertType)
  type: AlertType;

  @IsOptional()
  @IsObject()
  data: any;
}
