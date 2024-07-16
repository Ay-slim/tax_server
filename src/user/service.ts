import { Model, PipelineStage, Types } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UserDashboardDto } from './types';
import { User, Summary, Deduction, Country } from '../database/schema.types';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    @Inject('SUMMARY_MODEL')
    private summaryModel: Model<Summary>,
    @Inject('DEDUCTION_MODEL')
    private deductionModel: Model<Deduction>,
    @Inject('COUNTRY_MODEL')
    private countryModel: Model<Country>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { name, email, country_id, year, password } = createUserDto;
      const createdUser = await this.userModel.create({
        name,
        email,
        password,
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
    } catch (err) {
      throw err;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ user: User }> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne(
      {
        email,
        password,
      },
      'name email _id',
    );
    if (!user) {
      throw new Error('Invalid password');
    }
    return { user };
  }

  async fetchCountries(): Promise<Country[]> {
    return this.countryModel.find({}, '_id, name');
  }

  async dashboard(dashboardDto: UserDashboardDto) {
    const { user_id, year } = dashboardDto;
    //const user = await this.userModel.findById(user_id);
    const pipeline: PipelineStage[] = [
      {
        $match: {
          user_id: new Types.ObjectId(user_id),
          year: Number(year),
        },
      },
      {
        $lookup: {
          from: 'countries',
          as: 'country',
          localField: 'country_id',
          foreignField: '_id',
        },
      },
      {
        $project: {
          user_id: 1,
          country: {
            $ifNull: [{ $arrayElemAt: ['$country.name', 0] }, ''],
          },
          currency: {
            $ifNull: [{ $arrayElemAt: ['$country.currency', 0] }, ''],
          },
          country_id: 1,
          total_taxed_income: 1,
          total_deducted_tax: 1,
          current_tax_index: 1,
          current_tax_bracket: 1,
        },
      },
    ];
    const summary = await this.summaryModel.aggregate(pipeline);
    const deductions = await this.deductionModel.find({
      user_id,
      $expr: {
        $eq: [{ $year: '$date' }, Number(year)],
      },
    });
    const years = await this.summaryModel.distinct('year', {
      user_id,
    });
    // console.log(summary, deductions);
    return {
      summary: summary[0],
      deductions,
      years,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(_id);
  }
}
