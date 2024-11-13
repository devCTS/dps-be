import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationReadStatus } from 'src/utils/enum/enum';

export class CreateNotificationDto {
  @IsOptional()
  @IsString()
  type: string;

  @IsEnum(NotificationReadStatus)
  status: NotificationReadStatus;

  @IsOptional()
  @IsObject()
  data: any;

  @IsNotEmpty()
  @IsNumber()
  for: number;
}
