import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionUpdatesService } from './transaction-updates.service';
import { CreateTransactionUpdateDto } from './dto/create-transaction-update.dto';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';

@Controller('transaction-updates')
export class TransactionUpdatesController {
  constructor(private readonly transactionUpdatesService: TransactionUpdatesService) {}

  @Post()
  create(@Body() createTransactionUpdateDto: CreateTransactionUpdateDto) {
    return this.transactionUpdatesService.create(createTransactionUpdateDto);
  }

  @Get()
  findAll() {
    return this.transactionUpdatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionUpdatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionUpdateDto: UpdateTransactionUpdateDto) {
    return this.transactionUpdatesService.update(+id, updateTransactionUpdateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionUpdatesService.remove(+id);
  }
}
