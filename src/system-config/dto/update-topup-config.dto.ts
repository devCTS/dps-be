import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class UpdateTopupConfigDto {
  @IsString()
  topupThreshold: string;

  @IsNumber()
  topupAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  defaultTopupChannels: ChannelProfileDto[];
}
