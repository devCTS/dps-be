import { Body, Controller, Param, Post } from '@nestjs/common';
import { PayinService } from './payin.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { SortedBy } from 'src/utils/enum/enum';

@Controller('payin')
export class PayinController {
  constructor(private payinService: PayinService) {}

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinService.paginatePayins(paginateRequestDto);
  }
}
