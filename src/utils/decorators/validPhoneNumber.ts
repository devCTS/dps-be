import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

// Example regex for a basic phone number validation (adjust according to your specific needs)
const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;

export function IsValidPhoneNumber() {
  return Transform(
    ({ value }) => {
      if (!phoneNumberRegex.test(value)) {
        throw new BadRequestException(`Invalid phone number: ${value}`);
      }
      return value;
    },
    { toClassOnly: true },
  );
}
