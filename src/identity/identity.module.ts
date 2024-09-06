import { Module } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  providers: [IdentityRepository, IdentityService],
  controllers: [IdentityController],
  exports: [IdentityService],
})
export class IdentityModule {}
