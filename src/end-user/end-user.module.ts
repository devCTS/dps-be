import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndUser } from './entities/end-user.entity';
import { EndUserService } from './end-user.service';
import { EndUserController } from './end-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EndUser])],
  providers: [EndUserService],
  exports: [EndUserService],
  controllers: [EndUserController],
})
export class EndUserModule {}
