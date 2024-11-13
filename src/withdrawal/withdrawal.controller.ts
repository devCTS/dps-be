import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { WithdrawalMemberService } from './withdrawal-member.service';
import { WithdrawalMerchantService } from './withdrawal-merchant.service';
import { WithdrawalAgentService } from './withdrawal-agent.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { WithdrawalAdminService } from './withdrawal-admin.service';

@Controller('withdrawal')
export class WithdrawalController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly withdrawalMemberService: WithdrawalMemberService,
    private readonly withdrawalMerchantService: WithdrawalMerchantService,
    private readonly withdrawalAgentService: WithdrawalAgentService,
    private readonly withdrawalAdminService: WithdrawalAdminService,
  ) {}

  @Post()
  create(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalService.create(createWithdrawalDto);
  }

  @Post('admin/paginate')
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalAdminService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('admin/:id')
  getOrderDetailsForAdmin(@Param('id') id: string) {
    return this.withdrawalAdminService.getOrderDetails(id);
  }

  @Post('member/paginate')
  memberPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalMemberService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('member/:id')
  getOrderDetailsForMember(@Param('id') id: string) {
    return this.withdrawalMemberService.getOrderDetails(id);
  }

  @Post('merchant/paginate')
  merchantPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalMerchantService.paginateWithdrawals(
      paginateRequestDto,
    );
  }

  @Get('merchant/:id')
  getOrderDetailsForMerchant(@Param('id') id: string) {
    return this.withdrawalMerchantService.getOrderDetails(id);
  }

  @Post('agent/paginate')
  agentPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalAgentService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('agent/:id')
  getOrderDetailsForAgent(@Param('id') id: string) {
    return this.withdrawalAgentService.getOrderDetails(id);
  }

  @Get('member-channel-details/:id')
  getChannelProfileDetailsForMember(@Param('id') id: string) {
    return this.withdrawalMemberService.getChannelProfileDetails(+id);
  }

  @Get('merchant-channel-details/:id')
  getChannelProfileDetailsForMerchant(@Param('id') id: string) {
    return this.withdrawalMerchantService.getChannelProfileDetails(+id);
  }

  @Get('agent-channel-details/:id')
  getChannelProfileDetailsForAgent(@Param('id') id: string) {
    return this.withdrawalAgentService.getChannelProfileDetails(+id);
  }

  @Post('update-status-complete')
  updateStatusToComplete(@Body() body) {
    return this.withdrawalService.updateStatusToComplete(body);
  }

  @Post('update-status-rejected')
  updateStatusToRejected(@Body() body) {
    return this.withdrawalService.updateStatusToRejected(body);
  }

  @Post('update-status-failed')
  updateStatusToFailed(@Body() body) {
    return this.withdrawalService.updateStatusToFailed(body);
  }

  @Post('make-gateway-payout')
  makeGatewayPayout(@Body() body) {
    return this.withdrawalService.makeGatewayPayout(body);
  }

  @Put('success-notification/:id')
  handleNotificationStatusSuccess(@Param('id') id: string) {
    return this.withdrawalService.handleNotificationStatusSuccess(id);
  }
}
