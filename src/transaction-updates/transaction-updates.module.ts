import { Module } from '@nestjs/common';
import { TransactionUpdatesService } from './transaction-updates.service';
import { TransactionUpdatesController } from './transaction-updates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionUpdate } from './entities/transaction-update.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionUpdate])],
  controllers: [TransactionUpdatesController],
  providers: [TransactionUpdatesService],
  exports: [TransactionUpdatesService],
})
export class TransactionUpdatesModule {}
