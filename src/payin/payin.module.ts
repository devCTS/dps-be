import { Module } from '@nestjs/common';
import { PayinController } from './payin.controller';
import { PayinService } from './payin.service';
import { Payin } from './entities/payin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Payin])],
  controllers: [PayinController],
  providers: [PayinService],
})
export class PayinModule {}
