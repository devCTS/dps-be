import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PayoutAdminService } from './payout-admin.service';
import { PayoutMemberService } from './payout-member.service';
import { PayoutMerchantService } from './payout-merchant.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('payout')
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly payoutAdminService: PayoutAdminService,
    private readonly payoutMemberService: PayoutMemberService,
    private readonly payoutMerchantService: PayoutMerchantService,
  ) {}

  @Post()
  create(@Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutService.create(createPayoutDto);
  }

  @Get()
  findAll() {
    return this.payoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayoutDto: UpdatePayoutDto) {
    return this.payoutService.update(+id, updatePayoutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payoutService.remove(+id);
  }

  @Post('admin/paginate')
  adminPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutAdminService.paginate(paginateRequestDto);
  }

  @Post('merchant/paginate')
  merchantPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMerchantService.paginate(paginateRequestDto);
  }

  @Post('merchant-user/paginate')
  merchantUserPayouts(
    @Body() paginateRequestDto: PaginateRequestDto,
    @Query('searchSuggestion') searchSuggestion: any,
  ) {
    return this.payoutMerchantService.paginateMerchantUsers(
      paginateRequestDto,
      searchSuggestion,
    );
  }

  @Post('member/paginate')
  memberPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMemberService.paginate(paginateRequestDto);
  }

  @Get('admin/:id')
  getPayoutOrderDetailsAdmin(@Param('id') id: string) {
    return this.payoutAdminService.getPayoutDetails(id);
  }

  @Get('merchant/:id')
  getPayoutOrderDetailsMerchant(@Param('id') id: string) {
    return this.payoutMerchantService.getPayoutDetails(id);
  }

  @Get('member/:id')
  getPayoutOrderDetailsMember(@Param('id') id: string) {
    return this.payoutMemberService.getPayoutDetails(id);
  }

  @Post('update-status-assigned')
  updatePayoutStatusToAssigned(@Body() body) {
    return this.payoutService.updatePayoutStatusToAssigned(body);
  }

  @Post('update-status-complete')
  updatePayoutStatusToCompleted(@Body() body) {
    return this.payoutService.updatePayoutStatusToComplete(body);
  }

  @Post('update-status-failed')
  updatePayoutStatusToFailed(@Body() body) {
    return this.payoutService.updatePayoutStatusToFailed(body);
  }

  @Post('update-status-submitted')
  updatePayoutStatusToSubmitted(@Body() body) {
    return this.payoutService.updatePayoutStatusToSubmitted(body);
  }
}
