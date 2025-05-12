import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/common/services/base.service';
import { processAndUploadImage } from 'src/common/utils/file-upload.util';
import { s3 } from 'src/config/aws';

@Injectable()
// CODE SMELL #5 Large Class Solution: Split the class into smaller classes
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  /* CODE SMELL #5 Large Class
  async findAll(
      query: any,
      filterObject?: any,
    ): Promise<{ results: number; data: T[] }> {
      const queryFilter = filterObject || {};
      const apiFeatures = new ApiFeatures(this.model.find(queryFilter), query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
        .search();
  
      const documents = await apiFeatures.query;
      const count = await this.model.countDocuments(queryFilter);
      return { results: count, data: documents };
    }
  
    async findOne(query: any, session?: ClientSession): Promise<T> {
      const document = await this.model.findOne(query).session(session);
      if (!document) {
        throw new NotFoundException(`${this.model.modelName} was not found`);
      }
      return document;
    }
  
    async update(id: string, updateData: Partial<T>): Promise<T> {
      const updatedDocument = await this.model.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedDocument) {
        throw new NotFoundException(
          `${this.model.modelName} with ID ${id} not found`,
        );
      }
      return updatedDocument;
    }
  
    async delete(id: string): Promise<void> {
      const result = await this.model.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(
          `${this.model.modelName} with ID ${id} not found`,
        );
      }
    }
  */
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
