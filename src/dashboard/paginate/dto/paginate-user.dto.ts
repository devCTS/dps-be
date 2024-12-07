import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

enum SortedBy {
  LATEST = 'LATEST',
  OLDEST = 'OLDEST',
}

export class PaginateUserDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'startDate must be in the format DD/MM/YYYY',
  })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'endDate must be in the format DD/MM/YYYY',
  })
  endDate?: string;

  @IsOptional()
  @IsEnum(SortedBy)
  sortBy?: SortedBy;
}
