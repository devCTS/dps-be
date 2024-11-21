import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FiltersDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsEnum(['PAYINS', 'PAYOUTS', 'WITHDRAWALS'])
  @IsOptional()
  mode: 'PAYINS' | 'PAYOUTS' | 'WITHDRAWALS' | null;
}
