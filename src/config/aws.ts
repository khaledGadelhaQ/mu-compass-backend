import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const s3 = new S3({
  accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
  secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
  region: configService.get('AWS_REGION'),
});
