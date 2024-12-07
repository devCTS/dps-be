import { PartialType } from '@nestjs/mapped-types';
import { CreateGatewaySettingsDto } from './create-gateway.dto';

export class UpdateGatewaySettingsDto extends PartialType(
  CreateGatewaySettingsDto,
) {}
