import mongoose, { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateSummaryDto } from './types';
import { Summary } from '../database/schema.types';

@Injectable()
export class SummaryService {
  constructor(
    @Inject('SUMMARY_MODEL')
    private SummaryModel: Model<Summary>,
  ) {}

  async create(createSummaryDto: CreateSummaryDto): Promise<Summary> {
    const createdSummary = new this.SummaryModel(createSummaryDto);
    return createdSummary.save();
  }

  async findAll(): Promise<Summary[]> {
    return this.SummaryModel.find().exec();
  }

  async findByUserAndCountry(
    user_id: string,
    country_id: string,
    year: number,
  ): Promise<Summary> {
    return this.SummaryModel.findOne({ user_id, country_id, year });
  }

  async deleteById(_id: string): Promise<void> {
    await this.SummaryModel.findByIdAndDelete(_id);
  }

  async deleteMany(ids: Array<string>): Promise<void> {
    await this.SummaryModel.deleteMany({
      _id: {
        $in: ids.map((_id) => new mongoose.Types.ObjectId(_id)),
      },
    });
  }
}
