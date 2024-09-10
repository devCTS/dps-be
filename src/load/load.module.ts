import { Module } from '@nestjs/common';
import { LoadService } from './load.service';
import { LoadController } from './load.controller';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [LoadController],
  providers: [LoadService],
})
export class LoadModule {}
