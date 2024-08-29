import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChannelDetailsDto, UpdateChannelDto } from './dto/channel.dto';
import { ChannelsService } from './channels.service';

@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post()
  async addChannel(@Body() channelDetails: ChannelDetailsDto) {
    return this.channelsService.addChannel(channelDetails);
  }

  @Get()
  async getAllChannels() {
    return await this.channelsService.getAllChannels();
  }

  @Get('/:id')
  async getChannelById(@Param('id') id: string) {
    return await this.channelsService.getChannelById(id);
  }

  @Delete()
  async deleteAllChannels() {
    await this.channelsService.deleteAllChannels();
    return { message: 'Deleted all channels' };
  }

  @Patch('/:id')
  async updateChannel(
    @Body() updateChannelDetails: UpdateChannelDto,
    @Param('id') id: string,
  ) {
    return this.channelsService.updateChannel(updateChannelDetails, id);
  }
}
