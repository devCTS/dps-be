import { Gateway } from '../enums/gateways';
import { PayinMode } from '../enums/misc';

interface Range {
  lower: number;
  upper: number;
  gateway: Gateway;
}

interface Ratio {
  ratio: number;
  gateway: Gateway;
}

export interface PayinModeDetails {
  type: PayinMode;
  entries: number;
  ranges: Range[];
  ratios: Ratio[];
}
