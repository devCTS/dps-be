import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';

import { SystemConfig } from './entities/system-config.entity';
import { Identity } from 'src/identity/entities/identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig, Identity])],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
})
export class SystemConfigModule {}
