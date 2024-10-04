import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ChannelName } from 'src/utils/enum/enum';

export class UpdateChannelConfigDto {
  @IsNotEmpty()
  @IsEnum(ChannelName)
  name: ChannelName;

  @IsOptional()
  @IsBoolean()
  incoming?: boolean;

  @IsOptional()
  @IsBoolean()
  outgoing?: boolean;
}
