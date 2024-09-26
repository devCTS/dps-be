import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class UpdateTopupConfigDto {
  @IsNumber()
  topupThreshold: number;

  @IsNumber()
  topupAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  defaultTopupChannels: ChannelProfileDto[];
}
