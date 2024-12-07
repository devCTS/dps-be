import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelSettingsDto } from './create-channel.dto';

export class UpdateChannelSettinngsDto extends PartialType(
  CreateChannelSettingsDto,
) {}
