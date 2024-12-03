import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { AlertType, Users } from 'src/utils/enum/enum';

export class AlertCreateDto {
  @IsOptional()
  @IsNumber()
  for: number | null;

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
