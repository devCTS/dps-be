import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';

import { SystemConfig } from './entities/system-config.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig, Identity, TransactionUpdate]),
  ],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
