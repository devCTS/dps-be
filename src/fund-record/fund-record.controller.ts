import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FundRecordService } from './fund-record.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import {
  CreateSettlementDto,
  MemberSettlementDto,
} from './dto/create-fund-record.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Role } from 'src/utils/enum/enum';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('fund-record')
@UseGuards(RolesGuard)
export class FundRecordController {
  constructor(
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,
    private readonly fundRecordService: FundRecordService,
  ) {}

  @Post('/paginate')
  @Roles(Role.ALL)
  async paginateFundRecords(
    @Body() paginateRequestBody: PaginateRequestDto,
    @UserInReq() user,
  ) {
    let subMerchant = null;
    let email = user?.email;

    if (user.type?.includes('ADMIN')) email = null;

    if (user?.type?.includes('SUB')) {
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant', 'merchant.identity'],
      });
      email = subMerchant.merchant.identity.email;
    }

    return await this.fundRecordService.paginateFundRecords(
      paginateRequestBody,
      email,
    );
  }

  @Post('/admin-adjustment')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  async adminAdjustment(@Body() requestBody: CreateSettlementDto) {
    return await this.fundRecordService.adminAdjustment(requestBody);
  }

  @Post('/member-adjustment')
  @Roles(Role.MEMBER)
  async memberAdjustment(@Body() requestBody: MemberSettlementDto) {
    return await this.fundRecordService.memberAdjustment(requestBody);
  }
}
