import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class UpdateTopupConfigDto {
  @IsNumber()
  topupThreshold: number;

  @IsNumber()
  topupAmount: number;

  @IsNumber()
  topupServiceRate: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto;
}
