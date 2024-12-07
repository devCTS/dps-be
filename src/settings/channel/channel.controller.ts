import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelSettingsService } from './channel.service';
import { CreateChannelSettingsDto } from './dto/create-channel.dto';
import { UpdateChannelSettinngsDto } from './dto/update-channel.dto';
import { Channels } from 'src/utils/enums/channels';

@Controller('channel-settings')
export class ChannelSettingsController {
  constructor(private readonly service: ChannelSettingsService) {}

  @Post('load')
  loadChannelSettings() {
    return this.service.createChannelSettings();
  }

  @Patch(':name')
  async updateChannelSettings(
    @Body() updateChannelSettingsDto: UpdateChannelSettinngsDto,
    @Param('name') name: Channels,
  ) {
    return this.service.updateChannelSettings(name, updateChannelSettingsDto);
  }

  @Get()
  getAllChannelSettings() {
    return this.service.getAllChannelSettings();
  }

  @Get(':name')
  getChannelSettings(@Param('name') name: Channels) {
    return this.service.getChannelSettings(name);
  }
}
