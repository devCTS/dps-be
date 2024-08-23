import { forwardRef, Module } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';
import { Identity } from './identity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModule } from 'src/member/member.module';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Identity]),
    IdentityRepository,
    forwardRef(() => MemberModule),
  ],
  providers: [IdentityRepository, IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
