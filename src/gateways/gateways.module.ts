import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gateways } from './gateways.entity';
import { GatewaysRepository } from './gateways.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Gateways]), GatewaysRepository],
  providers: [GatewaysService, GatewaysRepository],
})
export class GatewaysModule {}
