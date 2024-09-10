import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ChannelProfileFieldDto } from './channelProfileField.dto';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Tag must only contain lowercase letters, numbers, or hyphens.',
  })
  tag: string;

  @IsBoolean()
  @IsNotEmpty()
  incomingStatus: boolean;

  @IsBoolean()
  @IsNotEmpty()
  outgoingStatus: boolean;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileFieldDto) // Transform array items to ChannelProfileFieldDto
  profileFields: ChannelProfileFieldDto[];
}
