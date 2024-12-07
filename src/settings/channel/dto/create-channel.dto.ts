import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Channels } from 'src/utils/enums/channels';

export class CreateChannelSettingsDto {
  @IsNotEmpty()
  @IsEnum(Channels)
  name: Channels;

  @IsNotEmpty()
  @IsBoolean()
  incoming: boolean;

  @IsNotEmpty()
  @IsBoolean()
  outgoing: boolean;

  @IsNotEmpty()
  @IsString()
  tagName: string;
}
