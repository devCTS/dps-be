import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { ChannelName } from 'src/utils/enum/enum';

@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post('update')
  async updateChannelConfig(
    @Body() updateChannelConfigDto: UpdateChannelConfigDto,
  ) {
    return this.channelService.updateChannelConfig(updateChannelConfigDto);
  }

  @Get('config')
  getAllConfig() {
    return this.channelService.getAllConfig();
  }

  @Get('config/:name')
  getConfig(@Param('name') name: ChannelName) {
    return this.channelService.getConfig(name);
  }
}
