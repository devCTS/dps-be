import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

// Helper function to convert DD/MM/YYYY to a valid Date object
// Helper function to convert DD/MM/YYYY to a UTC Date object
export const parseStartDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`); // Start of the day in UTC
  if (isNaN(date.getTime())) {
    throw new BadRequestException(
      'Invalid startDate format. Expected DD/MM/YYYY.',
    );
  }
  return date.toISOString();
};

export const parseEndDate = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  const date = new Date(`${year}-${month}-${day}T23:59:59Z`); // End of the day in UTC
  if (isNaN(date.getTime())) {
    throw new BadRequestException(
      'Invalid endDate format. Expected DD/MM/YYYY.',
    );
  }
  return date.toISOString();
};

export class PaginateRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => Number)
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
}
