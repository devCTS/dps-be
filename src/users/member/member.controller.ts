import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MemberService } from './member.service';

import { IdentityService } from '../identity/identity.service';
import { UpdateMemberDto } from './dto/request/update-member.dto';
import { CreateMemberDto } from './dto/request/create-member.dto';

@Controller('member')
export class MemberController {
  constructor(
    private readonly service: MemberService,
    private readonly identityService: IdentityService,
  ) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.service.create(createMemberDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.identityService.getUserDetails(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.service.update(id, updateMemberDto);
  }
}
