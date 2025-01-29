import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import uniqid from 'uniqid';

@Injectable()
export class UploadService {
  private s3Client: S3Client = null;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
  }

  async upload(file: Express.Multer.File, payinOrderId: string) {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${payinOrderId}_${uniqid()}`,
        Body: file.buffer,
        ContentType: 'image/jpg,jpeg,png',
      };

      const command = new PutObjectCommand(params);
      const data = await this.s3Client.send(command);

      if (data.$metadata.httpStatusCode !== 200) {
        return;
      }
      let url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      return { url, key: params.Key };
    } catch (err) {
      console.error(err);
    }
  }
}
