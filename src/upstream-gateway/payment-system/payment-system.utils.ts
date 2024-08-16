import { createHash } from 'node:crypto';

export const generateSHA256 = (payload: string) => {
  return createHash('sha256').update(payload).digest('hex');
};
