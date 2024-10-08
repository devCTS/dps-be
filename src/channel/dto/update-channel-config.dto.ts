import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelConfigDto } from './create-channel-config.dto';

export class UpdateChannelConfigDto extends PartialType(
  CreateChannelConfigDto,
) {}
