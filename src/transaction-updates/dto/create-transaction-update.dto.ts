import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

export class CreateTransactionUpdateDto {
  @IsEnum(OrderType)
  orderType: OrderType;

  @IsEnum(UserTypeForTransactionUpdates)
  userType: UserTypeForTransactionUpdates;

  @IsNumber()
  rate: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  before: number;

  @IsNumber()
  after: number;

  @IsBoolean()
  pending: boolean;
}
