import { Body, Controller, Post } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { PaginateRequestDto } from './dto/paginate.dto';

@Controller('bulletin')
export class BulletinController {
  constructor(private bulletinService: BulletinService) {}

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.bulletinService.paginate(paginateRequestDto);
  }
}
