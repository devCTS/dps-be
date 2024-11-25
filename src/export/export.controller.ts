import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { CreateExportDto } from './dto/create-export.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';

@Controller('export')
@UseGuards(RolesGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  create(@Body() createExportDto: CreateExportDto) {
    return this.exportService.create(createExportDto);
  }
}
