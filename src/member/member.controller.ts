import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RegisterDto } from './dto/register.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { UpdateCommissionRatesDto } from './dto/update-commission-rates.dto';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.memberService.registerViaSignup(registerDto);
  }

  @Get()
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  findOneForMember(@UserInReq() user) {
    return this.memberService.findOne(+user.id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }

  @Patch()
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  updateForMember(@UserInReq() user, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(+user.id, updateMemberDto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(+id, updateMemberDto);
  }

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.memberService.paginate(paginateRequestDto);
  }

  @Post('change-password')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserInReq() user,
  ) {
    return this.memberService.changePassword(changePasswordDto, user.id);
  }

  @Put('update-commission-rates')
  @Roles(Role.MEMBER)
  updateCommissionRates(@Body() requestDto: UpdateCommissionRatesDto) {
    return this.memberService.updateComissionRates(requestDto);
  }
}
