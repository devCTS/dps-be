import { Body, Controller, ParseBoolPipe, Post } from '@nestjs/common';
import { ChannelDetailsDto } from './dto/channel.dto';
import { ChannelsService } from './channels.service';

@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post()
  async addChannel(@Body() channelDetails: ChannelDetailsDto) {
    return this.channelsService.addChannel(channelDetails);
  }
}
