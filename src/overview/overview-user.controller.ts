import { Controller, Get, UseGuards } from '@nestjs/common';
import { OverviewUserService } from './overview-user.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Repository } from 'typeorm';

@Controller('overview-user')
export class OverviewUserController {
  constructor(
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,
    private readonly overviewUserService: OverviewUserService,
  ) {}

  @Get('agent')
  @Roles(Role.AGENT)
  @UseGuards(RolesGuard)
  getAgentOverviewDetails(@UserInReq() user) {
    return this.overviewUserService.getAgentOverviewDetails(+user.id);
  }

  @Get('merchant')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async getMerchantOverviewDetails(@UserInReq() user) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.overviewUserService.getMerchantOverviewDetails(+merchantId);
  }

  @Get('member')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  getMemberOverviewDetails(@UserInReq() user) {
    return this.overviewUserService.getMemberOverviewDetails(+user.id);
  }
}
