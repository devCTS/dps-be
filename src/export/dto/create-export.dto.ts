import { IsString, IsNotEmpty } from 'class-validator';

export class CreateExportDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  tableName: string;
}
