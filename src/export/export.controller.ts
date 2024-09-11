import { Controller, Post, Body } from '@nestjs/common';
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/create-export.dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  create(@Body() createExportDto: CreateExportDto) {
    return this.exportService.create(createExportDto);
  }
}
