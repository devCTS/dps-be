export interface FeeModeDetails {
  mode: 'ABSOLUTE' | 'PERCENTAGE' | 'COMBINATION';
  absoluteAmount: number;
  percentageAmount: number;
}
