import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class MarkNotificationReadDto {
  @IsArray()
  @IsInt({ each: true })
  notificationsIds: number[];
}
