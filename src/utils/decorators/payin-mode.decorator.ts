import { Transform } from 'class-transformer';

export function TransformPayinModeDetails() {
  return Transform(
    ({ obj }) => {
      let res: any = null;
      if (obj.payinModeDetails.type === 'AMOUNT_RANGE') {
        res = { ...obj.payinModeDetails.amountRangeRange }; // Clone amountRangeRange object
        delete res.id; // Remove the id field
      }

      if (obj.payinModeDetails.type === 'PROPORTIONAL') {
        res = { ...obj.payinModeDetails.proportionalRange }; // Clone proportionalRange object
        delete res.id; // Remove the id field
      }

      return res;
    },
    { toClassOnly: true },
  );
}
