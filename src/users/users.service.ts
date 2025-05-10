import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/common/services/base.service';
import { processAndUploadImage } from 'src/common/utils/file-upload.util';
import { s3 } from 'src/config/aws';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async createUser(user: Partial<UserDocument>): Promise<UserDocument> {
    // Check if a user with the given email already exists
    const existingUser = await this.userModel
      .findOne({ email: user.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return super.create(user);
  }

  async uploadProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this.userModel.findOne({ _id: userId });
    // delete old user images from the bucket before uploading new ones.
    if (user.profileImage !== 'default.image.jpeg') { 
      await s3
        .deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: user.profileImage,
        })
        .promise();
    }
    const imageUrl = await processAndUploadImage(file, 'users');
    // update user profile in DB
    await super.update(userId, { profileImage: imageUrl });

    return imageUrl;
  }
}
