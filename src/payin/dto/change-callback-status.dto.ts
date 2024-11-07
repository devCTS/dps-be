import { IsNotEmpty, IsString } from 'class-validator';
import { CallBackStatus } from 'src/utils/enum/enum';

export class ChangeCallbackStatusDto {
  @IsNotEmpty()
  @IsString()
  systemOrderId: string;

  @IsNotEmpty()
  @IsString()
  callbackStatus: CallBackStatus;
}
