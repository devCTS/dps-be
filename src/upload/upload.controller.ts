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
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('receipt/:payinOrderId')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('payinOrderId') payinOrderId: string,
  ) {
    return this.uploadService.upload(file, payinOrderId);
  }

  @Get()
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Delete(':id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.uploadService.remove(+id);
  }
}
