import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { jsonToExcel } from './utils/utils';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Content-Disposition', 'attachment; filename=file.xlsx');
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const jsonData = [
      { name: 'Name1', age: 26 },
      { name: 'Name2', age: 19 },
    ];
    const data = await jsonToExcel(jsonData);
    response.send(data);
  }
}
