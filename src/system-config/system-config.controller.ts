import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateGatewaysTimeoutsDto } from './dto/update-gateways-timeouts.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { UpdateTopupConfigDto } from './dto/update-topup-config.dto';
import { UpdateMemberDefaultsDto } from './dto/update-member-defaults.dto';
import { UpdateMerchantDefaultsDto } from './dto/update-merchant-defaults.dto';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  create(@Body() createSystemConfigDto: CreateSystemConfigDto) {
    return this.systemConfigService.create(createSystemConfigDto);
  }

  @Get('/latest')
  findOne() {
    return this.systemConfigService.findLatestWithResponseDto();
  }

  @Get()
  findAll() {
    return this.systemConfigService.findAll();
  }

  @Patch('/gateways-and-timeouts')
  update(@Body() updateGatewaysTimeoutsDto: UpdateGatewaysTimeoutsDto) {
    return this.systemConfigService.updateGatewaysAndTimeouts(
      updateGatewaysTimeoutsDto,
    );
  }

  @Patch('/currency')
  updateCurrency(@Body() currencyDto: UpdateCurrencyDto) {
    return this.systemConfigService.updateCurrency(currencyDto);
  }

  @Patch('/topup-config')
  updateTopupConfigurations(
    @Body() updateTopupConfigDto: UpdateTopupConfigDto,
  ) {
    return this.systemConfigService.updateTopupConfigurations(
      updateTopupConfigDto,
    );
  }

  @Patch('/member-defaults')
  updateMemberDefaults(
    @Body() updateMemberDefaultsDto: UpdateMemberDefaultsDto,
  ) {
    return this.systemConfigService.updateMemberDefaults(
      updateMemberDefaultsDto,
    );
  }

  @Patch('/merchant-defaults')
  updateMerchantDefaults(
    @Body() updateMerchantDefaultsDto: UpdateMerchantDefaultsDto,
  ) {
    return this.systemConfigService.updateMerchantDefaults(
      updateMerchantDefaultsDto,
    );
  }
}
