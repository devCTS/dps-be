import { IsNumber, IsObject, Validate } from 'class-validator';
import { GatewayName } from 'src/utils/enum/enum';

export class UpdateGatewaysTimeoutsDto {
  @IsObject()
  @GatewayValidator()
  defaultPayinGateway: object;

  @IsObject()
  @GatewayValidator()
  defaultPayoutGateway: object;

  @IsObject()
  @GatewayValidator()
  defaultWithdrawalGateway: object;

  @IsNumber()
  payinTimeout: number;

  @IsNumber()
  payoutTimeout: number;
}

function GatewayValidator() {
  return Validate((value: object) => {
    if (typeof value !== 'object' || Array.isArray(value)) return false;

    for (const key in value) {
      const numberKey = parseInt(key, 10);
      if (isNaN(numberKey) || !Object.values(GatewayName).includes(value[key]))
        return false;
    }
    return true;
  });
}
