import { s3 } from 'src/config/aws';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

/**
 * Uploads an image buffer to S3.
 */
async function uploadToS3(
  fileBuffer: Buffer,
  filename: string,
  folder: string,
) {
  const key = `${folder}/${uuid()}-${filename}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg',
    ACL: 'private',
  };

  await s3
    .upload(uploadParams, (err, data) => {
      if (err) {
        console.error('S3 Upload Error:', err);
        throw new Error('File upload failed');
      }
      console.log('File uploaded successfully:', data);
    })
    .promise();

  return key;
}

/**
 * Processes an image (resizing) before uploading.
 */
export async function processAndUploadImage(
  file: Express.Multer.File,
  folder: string,
  width = 500,
  height = 500,
) {
  if (!file || !file.buffer) {
    throw new Error('File buffer is missing');
  }
  const resizedImage = await sharp(file.buffer)
    .resize(width, height)
    .toFormat('jpeg')
    .toBuffer();
  return uploadToS3(resizedImage, file.originalname, folder);
}

/**
 * Processes multiple images.
 */
export async function processAndUploadMultipleImages(
  files: Express.Multer.File[],
  folder: string,
) {
  return Promise.all(
    files.map((file) => processAndUploadImage(file, folder, 800, 600)),
  ); // Resize each image
}
