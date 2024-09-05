import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { IdentityModule } from 'src/identity/identity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantRepository } from 'src/merchant/merchant.repository';
import { Member } from './member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), IdentityModule],
  providers: [MerchantRepository, MemberService],
  controllers: [MemberController],
})
export class MemberModule {}
