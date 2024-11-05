import { IsEnum, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';

export class CreateTopupDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channel: ChannelName;

  @IsNotEmpty()
  @IsString()
  channelDetails: string;
}
