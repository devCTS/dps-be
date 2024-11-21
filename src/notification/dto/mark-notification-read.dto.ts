import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class MarkNotificationReadDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsArray()
  @IsInt({ each: true })
  notificationsIds: number[];
}
