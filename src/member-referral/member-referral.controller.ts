import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MemberReferralService } from './member-referral.service';
import { CreateMemberReferralDto } from './dto/create-member-referral.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { UpdateMemberReferralDto } from './dto/update-member-referral.dto';

@Controller('member-referral')
export class MemberReferralController {
  constructor(private readonly memberReferralService: MemberReferralService) {}

  @Post()
  create(@Body() createMemberReferralDto: CreateMemberReferralDto) {
    return this.memberReferralService.create(createMemberReferralDto);
  }

  @Get()
  findAll() {
    return this.memberReferralService.findAll();
  }

  @Get('/tree')
  getReferralTree() {
    return this.memberReferralService.getReferralTree();
  }

  @Get('/tree/:userId')
  getReferralTreeOfUser(@Param('userId') userId: string) {
    return this.memberReferralService.getReferralTreeOfUser(+userId);
  }

  @Get('/referral/:code')
  findOneByCode(@Param('code') code: string) {
    return this.memberReferralService.findOneByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberReferralService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMemberReferralDto: UpdateMemberReferralDto,
  ) {
    return this.memberReferralService.update(+id, updateMemberReferralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberReferralService.remove(+id);
  }

  @Delete()
  removeAll() {
    return this.memberReferralService.removeAll();
  }

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberReferralService.paginate(paginateRequestDto);
  }

  @Post('used-codes/paginate')
  paginateUsedCodes(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberReferralService.paginate(paginateRequestDto, true);
  }
}
