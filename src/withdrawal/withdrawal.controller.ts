import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { WithdrawalMerchantService } from './withdrawal-merchant.service';
import { WithdrawalAgentService } from './withdrawal-agent.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { WithdrawalAdminService } from './withdrawal-admin.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { Repository } from 'typeorm';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('withdrawal')
export class WithdrawalController {
  constructor(
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,
    private readonly withdrawalService: WithdrawalService,
    private readonly withdrawalMerchantService: WithdrawalMerchantService,
    private readonly withdrawalAgentService: WithdrawalAgentService,
    private readonly withdrawalAdminService: WithdrawalAdminService,
  ) {}

  @Post()
  @Roles(Role.MERCHANT, Role.AGENT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async create(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @UserInReq() user,
  ) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;
    let email;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    email = subMerchant ? subMerchant.merchant.email : user.email;

    return this.withdrawalService.create(createWithdrawalDto, email);
  }

  @Post('admin/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalAdminService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('admin/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getOrderDetailsForAdmin(@Param('id') id: string) {
    return this.withdrawalAdminService.getOrderDetails(id);
  }

  @Post('merchant/paginate')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async merchantWithdrawals(
    @Body() paginateRequestDto: PaginateRequestDto,
    @UserInReq() user,
  ) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.withdrawalMerchantService.paginateWithdrawals(
      paginateRequestDto,
      +merchantId,
    );
  }

  @Get('merchant/:id')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  getOrderDetailsForMerchant(@Param('id') id: string) {
    return this.withdrawalMerchantService.getOrderDetails(id);
  }

  @Post('agent/paginate')
  @Roles(Role.AGENT)
  @UseGuards(RolesGuard)
  agentPayins(
    @Body() paginateRequestDto: PaginateRequestDto,
    @UserInReq() user,
  ) {
    return this.withdrawalAgentService.paginateWithdrawals(
      paginateRequestDto,
      +user.id,
    );
  }

  @Get('agent/:id')
  @Roles(Role.AGENT)
  @UseGuards(RolesGuard)
  getOrderDetailsForAgent(@Param('id') id: string) {
    return this.withdrawalAgentService.getOrderDetails(id);
  }

  @Get('merchant-channel-details')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async getChannelProfileDetailsForMerchant(@UserInReq() user) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.withdrawalMerchantService.getChannelProfileDetails(+merchantId);
  }

  @Get('agent-channel-details/:id')
  @Roles(Role.AGENT)
  @UseGuards(RolesGuard)
  getChannelProfileDetailsForAgent(@UserInReq() user) {
    return this.withdrawalAgentService.getChannelProfileDetails(+user.id);
  }

  @Post('update-status-complete')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateStatusToComplete(@Body() body) {
    return this.withdrawalService.updateStatusToComplete(body);
  }

  @Post('update-status-rejected')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
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
  @Roles(Role.AGENT, Role.MERCHANT)
  @UseGuards(RolesGuard)
  handleNotificationStatusSuccess(@Param('id') id: string) {
    return this.withdrawalService.handleNotificationStatusSuccess(id);
  }
}
