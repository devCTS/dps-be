import * as crypto from 'crypto';

export const makeKey = async (key: string) => {
  return await crypto.subtle.importKey(
    'raw',
    Buffer.from(key, 'base64'),
    {
      name: 'AES-CBC',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
};
