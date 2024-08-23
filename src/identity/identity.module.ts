import { Module } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';
import { Identity } from './identity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Identity]), IdentityRepository],
  providers: [IdentityRepository],
})
export class IdentityModule {}
