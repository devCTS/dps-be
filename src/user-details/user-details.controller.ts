import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserDetailsAdminService } from './user-details-admin.service';
import { UserDetailsAgentService } from './user-details-agent.service';
import { UserDetailsMemberService } from './user-details-member.service';
import { UserDetailsMerchantService } from './user-details-merchant.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('user-details')
export class UserDetailsController {
  constructor(
    private readonly userDetailsAdminService: UserDetailsAdminService,
    private readonly userDetailsAgentService: UserDetailsAgentService,
    private readonly userDetailsMemberService: UserDetailsMemberService,
    private readonly userDetailsMerchantService: UserDetailsMerchantService,
  ) {}

  // ADMIN
  @Get('admin/:userId')
  getAdminDetails(@Param('userId') userId: string) {
    return this.userDetailsAdminService.getAdminDetails(+userId);
  }

  // AGENT
  @Get('agent/:userId')
  getAgentDetails(@Param('userId') userId: string) {
    return this.userDetailsAgentService.getAgentDetails(+userId);
  }
  @Post('agent/withdrawals/paginate')
  paginateAgentWithdrawals(@Body() body: PaginateRequestDto) {
    return this.userDetailsAgentService.paginateAgentWithdrawals(body);
  }
  @Post('agent/commissions/paginate')
  paginateAgentCommissions(@Body() body: PaginateRequestDto) {
    return this.userDetailsAgentService.paginateAgentCommissions(body);
  }
  @Post('agent/fund-records/paginate')
  paginateAgentFundRecords(@Body() body: PaginateRequestDto) {
    return this.userDetailsAgentService.paginateAgentFundRecords(body);
  }

  // MEMBER
  @Get('member/:userId')
  getMemberDetails(@Param('userId') userId: string) {
    return this.userDetailsMemberService.getMemberDetails(+userId);
  }
  @Post('member/payins/paginate')
  paginateMemberPayins(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberPayins(body);
  }
  @Post('member/payouts/paginate')
  paginateMemberPayouts(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberPayouts(body);
  }
  @Post('member/withdrawals/paginate')
  paginateMemberWithdrawals(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberWithdrawals(body);
  }
  @Post('member/topups/paginate')
  paginateMemberTopups(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberTopups(body);
  }
  @Post('member/commissions/paginate')
  paginateMemberCommissions(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberCommissions(body);
  }
  @Post('member/fund-records/paginate')
  paginateMemberFundRecords(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberFundRecords(body);
  }

  // MERCHANT
  @Get('merchant/:userId')
  getMerchantDetails(@Param('userId') userId: string) {
    return this.userDetailsMerchantService.getMerchantDetails(+userId);
  }
  @Post('merchant/payins/paginate')
  paginateMerchantPayins(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantPayins(body);
  }
  @Post('merchant/payouts/paginate')
  paginateMerchantPayouts(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantPayouts(body);
  }
  @Post('merchant/withdrawals/paginate')
  paginateMerchantWithdrawals(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantWithdrawals(body);
  }
  @Post('merchant/fund-records/paginate')
  paginateMerchantFundRecords(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantFundRecords(body);
  }
}
