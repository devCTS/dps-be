import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';

export class CreateChannelConfigDto {
  @IsNotEmpty()
  @IsEnum(ChannelName)
  name: ChannelName;

  @IsNotEmpty()
  @IsBoolean()
  incoming: boolean;

  @IsNotEmpty()
  @IsBoolean()
  outgoing: boolean;

  @IsNotEmpty()
  @IsString()
  tag_name: string;
}
