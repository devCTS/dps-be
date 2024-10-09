import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndUser } from './entities/end-user.entity';
import { EndUserService } from './end-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([EndUser])],
  providers: [EndUserService],
  exports: [EndUserService],
})
export class EndUserModule {}
