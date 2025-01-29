import { Transform } from 'class-transformer';
import  moment from 'moment';

export function DateFormat(format = 'DD MMM, YYYY | hh:mm a') {
  return Transform(({ value }) => moment(value).format(format), {
    toClassOnly: true,
  });
}
