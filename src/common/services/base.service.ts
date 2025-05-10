import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiFeatures } from './api-features';

@Injectable()
export class BaseService<T> {
  constructor(@InjectModel('') private readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

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
}
