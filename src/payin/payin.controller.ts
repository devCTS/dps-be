import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { PayinAdminService } from './payin-admin.service';
import { PayinMerchantService } from './payin-merchant.service';
import { PayinMemberService } from './payin-member.service';
import { PayinService } from './payin.service';

@Controller('payin')
export class PayinController {
  constructor(
    private payinAdminService: PayinAdminService,
    private payinMemberService: PayinMemberService,
    private payinMerchantService: PayinMerchantService,
    private payinService: PayinService,
  ) {}

  @Post()
  create(@Body() createPayinDto) {
    return this.payinService.create(createPayinDto);
  }

  @Post('paginate')
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinAdminService.paginatePayins(paginateRequestDto);
  }

  @Get('admin/:id')
  getPayinOrderDetails(@Param('id', ParseIntPipe) id: number) {
    return this.payinAdminService.getPayinDetails(id);
  }

  @Post('update-status-assigned')
  updatePayinStatusToAssigned(@Body() body) {
    return this.payinService.updatePayinStatusToAssigned(body);
  }

  @Post('update-status-completed')
  updatePayinStatusToCompleted(@Body() body) {
    return this.payinService.updatePayinStatusToComplete(body);
  }

  @Post('update-status-failed')
  updatePayinStatusToFailed(@Body() body) {
    return this.payinService.updatePayinStatusToFailed(body);
  }

  @Post('update-status-submitted')
  updatePayinStatusToSubmitted(@Body() body) {
    return this.payinService.updatePayinStatusToSubmitted(body);
  }
}
