import { Request } from 'express';
import { validateBufferMIMEType } from 'validate-image-type';

type ValidMimeType = 'image/jpeg' | 'image/jpg' | 'image/png';

const validMimeTypes: ValidMimeType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const saveImageToStorage = {
  fileFilter: (req: Request, file, cb: any) => {
    const allowedMimeTypes: ValidMimeType[] = validMimeTypes;
    allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
  limits: {
    // max 20 Mb is allowed
    fileSize: 20971520,
  },
};

export const isFileExtensionSave = async (buffer) => {
  const result = await validateBufferMIMEType(buffer, {
    allowMimeTypes: validMimeTypes,
  });
  return result;
};

export const convertToBase64 = (file: Express.Multer.File) => {
  const base64Image = file.buffer.toString('base64');
  const mimeType = file.mimetype;
  return `data:${mimeType};base64,${base64Image}`;
};
