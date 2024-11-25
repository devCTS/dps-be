import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateGatewaysTimeoutsDto } from './dto/update-gateways-timeouts.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { UpdateTopupConfigDto } from './dto/update-topup-config.dto';
import { UpdateMemberDefaultsDto } from './dto/update-member-defaults.dto';
import { UpdateMerchantDefaultsDto } from './dto/update-merchant-defaults.dto';
import { UpdateWithdrawalDefaultsDto } from './dto/update-withdrawal-default.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create() {
    return this.systemConfigService.create();
  }

  @Get('/latest')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  findOne() {
    return this.systemConfigService.findLatestWithResponseDto();
  }

  @Get()
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  findAll() {
    return this.systemConfigService.findAll();
  }

  @Patch('/gateways-and-timeouts')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Body() updateGatewaysTimeoutsDto: UpdateGatewaysTimeoutsDto) {
    return this.systemConfigService.updateGatewaysAndTimeouts(
      updateGatewaysTimeoutsDto,
    );
  }

  @Patch('/currency')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateCurrency(@Body() currencyDto: UpdateCurrencyDto) {
    return this.systemConfigService.updateCurrency(currencyDto);
  }

  @Patch('/topup-config')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateTopupConfigurations(
    @Body() updateTopupConfigDto: UpdateTopupConfigDto,
  ) {
    return this.systemConfigService.updateTopupConfigurations(
      updateTopupConfigDto,
    );
  }

  @Patch('/member-defaults')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateMemberDefaults(
    @Body() updateMemberDefaultsDto: UpdateMemberDefaultsDto,
  ) {
    return this.systemConfigService.updateMemberDefaults(
      updateMemberDefaultsDto,
    );
  }

  @Patch('/merchant-defaults')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateMerchantDefaults(
    @Body() updateMerchantDefaultsDto: UpdateMerchantDefaultsDto,
  ) {
    return this.systemConfigService.updateMerchantDefaults(
      updateMerchantDefaultsDto,
    );
  }

  @Patch('/withdrawal-defaults')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateWithdrawalDefaults(
    @Body() updateWithdrawalDefaultsDto: UpdateWithdrawalDefaultsDto,
  ) {
    return this.systemConfigService.updateWithdrawalDefaults(
      updateWithdrawalDefaultsDto,
    );
  }
}
