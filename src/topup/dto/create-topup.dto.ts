import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';

export class CreateTopupDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channel: ChannelName;

  @IsNotEmpty()
  @IsObject()
  channelDetails: any;

  @IsOptional()
  @IsString()
  memberId?: string;
}
