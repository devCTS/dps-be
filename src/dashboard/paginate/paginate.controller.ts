import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaginateService } from './paginate.service';
import { PaginateUserDto } from './dto/paginate-user.dto';
import { Users } from 'src/utils/enums/users';

@Controller('paginate')
export class PaginateController {
  constructor(private readonly paginateService: PaginateService) {}

  @Post('admin')
  create(@Body() paginateDto: PaginateUserDto) {
    return this.paginateService.paginateUser(Users.ADMIN, paginateDto);
  }
}
