import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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

  @Get('member/:id')
  getChannelProfileDetailsForMember(@Param('id') id: string) {
    return this.withdrawalMemberService.getChannelProfileDetails(+id);
  }

  @Get('merchant/:id')
  getChannelProfileDetailsForMerchant(@Param('id') id: string) {
    return this.withdrawalMerchantService.getChannelProfileDetails(+id);
  }

  @Get('agent/:id')
  getChannelProfileDetailsForAgent(@Param('id') id: string) {
    return this.withdrawalAgentService.getChannelProfileDetails(+id);
  }
}
