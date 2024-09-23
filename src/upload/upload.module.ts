import { Module } from '@nestjs/common';
import { UploadService } from './Upload.service';

@Module({
  imports: [],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
