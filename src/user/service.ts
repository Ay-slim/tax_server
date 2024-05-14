import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './types';
import { User, Summary } from '../database/schema.types';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    @Inject('SUMMARY_MODEL')
    private summaryModel: Model<Summary>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, country_id, year } = createUserDto;
    const createdUser = await this.userModel.create({
      name,
      email,
    });
    await this.summaryModel.create({
      user_id: createdUser._id,
      year,
      country_id,
      total_taxed_income: 0,
      total_deducted_tax: 0,
      current_tax_index: 0,
    });
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(_id);
  }
}
