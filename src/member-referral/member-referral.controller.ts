import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MemberReferralService } from './member-referral.service';
import { CreateMemberReferralDto } from './dto/create-member-referral.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { UpdateMemberReferralDto } from './dto/update-member-referral.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('member-referral')
export class MemberReferralController {
  constructor(private readonly memberReferralService: MemberReferralService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  create(@Body() createMemberReferralDto: CreateMemberReferralDto) {
    return this.memberReferralService.create(createMemberReferralDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.memberReferralService.findAll();
  }

  @Get('/referral/:code')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  findOneByCode(@Param('code') code: string) {
    return this.memberReferralService.findOneByCode(code);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.memberReferralService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateMemberReferralDto: UpdateMemberReferralDto,
  ) {
    return this.memberReferralService.update(+id, updateMemberReferralDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.memberReferralService.remove(+id);
  }

  @Delete()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  removeAll() {
    return this.memberReferralService.removeAll();
  }

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberReferralService.paginate(paginateRequestDto);
  }

  @Post('used-codes/paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  paginateUsedCodes(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberReferralService.paginate(paginateRequestDto, true);
  }

  @Get('team-referral-codes/:teamId')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  getTeamReferralCodes(@Param('teamId') teamId: string) {
    return this.memberReferralService.getTeamReferralCodes(teamId);
  }
}
