import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { PayinAdminService } from './payin-admin.service';
import { PayinMerchantService } from './payin-merchant.service';
import { PayinMemberService } from './payin-member.service';
import { PayinService } from './payin.service';
import { ChangeCallbackStatusDto } from './dto/change-callback-status.dto';

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

  @Post('admin/paginate')
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinAdminService.paginatePayins(paginateRequestDto);
  }

  @Post('merchant/paginate')
  merchantPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinMerchantService.paginatePayins(paginateRequestDto);
  }

  @Post('member/paginate')
  memberPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinMemberService.paginatePayins(paginateRequestDto);
  }

  @Get()
  getAllPayins() {
    return this.payinService.findAll();
  }

  @Get('admin/:id')
  getPayinOrderDetailsAdmin(@Param('id') id: string) {
    return this.payinAdminService.getPayinDetails(id);
  }

  @Get('merchant/:id')
  getPayinOrderDetailsMerchant(@Param('id') id: string) {
    return this.payinMerchantService.getPayinDetails(id);
  }

  @Get('member/:id')
  getPayinOrderDetailsMember(@Param('id') id: string) {
    return this.payinMemberService.getPayinDetails(id);
  }

  @Post('update-status-assigned')
  updatePayinStatusToAssigned(@Body() body) {
    return this.payinService.updatePayinStatusToAssigned(body);
  }

  @Post('update-status-complete')
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

  @Put('success-callback')
  handleCallbackStatusSuccess(
    @Body() changeCallbackStatusDto: ChangeCallbackStatusDto,
  ) {
    return this.payinService.changeCallbackStatus(changeCallbackStatusDto);
  }
}
