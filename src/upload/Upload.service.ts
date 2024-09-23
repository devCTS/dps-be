import { BadRequestException, Injectable } from '@nestjs/common';
import { convertToBase64, isFileExtensionSave } from './helpers/image-upload';

@Injectable()
export class UploadService {
  async uploadImage(file: any) {
    // types
    type ValidFileExtension = 'jpeg' | 'jpg' | 'png';
    type ValidMimeType = 'image/jpeg' | 'image/jpg' | 'image/png';

    const validFileExtensions: ValidFileExtension[] = ['jpeg', 'jpg', 'png'];
    const validMimeTypes: ValidMimeType[] = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    const fileName = file?.originalname;

    // check for file name
    if (!fileName) throw new BadRequestException('File must be png jpg/jpeg.');

    // allowed size 20 MB
    if (file.size < 20971520)
      throw new BadRequestException('File size should be less than 20 MB');

    // Valid mime
    if (!validMimeTypes.includes(file.mimetype))
      throw new BadRequestException('Invalid file mime type.');

    // check valid mime type
    const isValidImage = await isFileExtensionSave(file.buffer);
    if (!isValidImage)
      throw new BadRequestException('Invalid image mime type.');

    return convertToBase64(file);
  }
}
