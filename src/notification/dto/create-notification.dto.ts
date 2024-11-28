import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationReadStatus, NotificationType } from 'src/utils/enum/enum';

export class CreateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsObject()
  data: any;

  @IsString()
  @IsOptional()
  for: string | null;
}
