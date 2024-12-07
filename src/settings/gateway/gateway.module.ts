import { Module } from '@nestjs/common';
import { GatewaySettingsService } from './gateway.service';
import { GatewaySettingsController } from './gateway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewaySettings } from './entities/gateway.entity';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [TypeOrmModule.forFeature([GatewaySettings]), IntegrationsModule],
  controllers: [GatewaySettingsController],
  providers: [GatewaySettingsService],
})
export class GatewayModule {}
