import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('receipt/:payinOrderId')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('payinOrderId') payinOrderId: string,
  ) {
    return this.uploadService.upload(file, payinOrderId);
  }

  @Get()
  findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadService.remove(+id);
  }
}
