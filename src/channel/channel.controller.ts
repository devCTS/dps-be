import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { ChannelName, Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('channel')
@UseGuards(RolesGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post('load-channels')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  loadChannelConfig() {
    return this.channelService.createChannelConfig();
  }

  @Patch('update')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  async updateChannelConfig(
    @Body() updateChannelConfigDto: UpdateChannelConfigDto,
  ) {
    return this.channelService.updateChannelConfig(updateChannelConfigDto);
  }

  @Get('config')
  @Roles(Role.ALL)
  getAllConfig() {
    return this.channelService.getAllConfig();
  }

  @Get('config/:name')
  @Roles(Role.ALL)
  getConfig(@Param('name') name: ChannelName) {
    return this.channelService.getConfig(name);
  }
}
