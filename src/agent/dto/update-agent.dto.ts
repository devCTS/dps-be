import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateAgentDto } from './create-agent.dto';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { Type } from 'class-transformer';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @IsBoolean()
  @IsNotEmpty()
  updateLoginCredentials: boolean;
}

export class UpdateAgentChannelDto {
  @IsOptional()
  @Type(() => ChannelProfileDto)
  @ValidateNested({ each: true })
  channelProfile: ChannelProfileDto;
}
