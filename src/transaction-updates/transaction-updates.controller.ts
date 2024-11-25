import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionUpdatesService } from './transaction-updates.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('transaction-updates')
export class TransactionUpdatesController {
  constructor(
    private readonly transactionUpdatesService: TransactionUpdatesService,
  ) {}

  @Post('commissions/paginate')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  allCommissions(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.transactionUpdatesService.paginateCommissionsAndProfits(
      paginateRequestDto,
    );
  }
}
