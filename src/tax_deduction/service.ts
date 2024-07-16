import mongoose, { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateDeductionDto } from './types';
import { Country, Deduction, Summary } from '../database/schema.types';
import { taxComp } from '../utils/taxComputation';

@Injectable()
export class DeductionService {
  constructor(
    @Inject('DEDUCTION_MODEL')
    private DeductionModel: Model<Deduction>,
    @Inject('SUMMARY_MODEL')
    private SummaryModel: Model<Summary>,
    @Inject('COUNTRY_MODEL')
    private CountryModel: Model<Country>,
  ) {}

  async create(createDeductionDto: CreateDeductionDto): Promise<Deduction> {
    const { user_id, description, income, date, country_id } =
      createDeductionDto;
    const year = new Date(date).getFullYear();
    const summary = await this.SummaryModel.findOne({
      user_id,
      country_id,
      year,
    });
    // console.log(summary, 'SUMMARYYY');
    const country = await this.CountryModel.findById(country_id);
    // console.log(country, 'COUNTRYYYYY');
    const tax = await taxComp(
      income,
      summary?.total_taxed_income || 0,
      summary?.current_tax_index || 0,
      country.tax_brackets,
    );
    console.log(date, 'INCOMEEE IN SER IDEE');
    const deduction = await this.DeductionModel.create({
      user_id,
      description,
      income,
      country_id,
      tax: tax.newlyDeductedTax,
      date: new Date(date),
    });
    // console.log(deduction, 'DEDUCTION IN SERVICE FILEE');
    await this.SummaryModel.findOneAndUpdate(
      {
        user_id,
        country_id,
        year,
      },
      {
        total_taxed_income: (summary?.total_taxed_income || 0) + income,
        total_deducted_tax:
          (summary?.total_deducted_tax || 0) + tax.newlyDeductedTax,
        current_tax_index: tax.newBandIndex,
        current_tax_bracket: tax.currentBracket,
      },
      { upsert: true },
    );
    return deduction;
  }

  async findAll(): Promise<Deduction[]> {
    return this.DeductionModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.DeductionModel.findByIdAndDelete(_id);
  }

  async deleteMany(ids: Array<string>): Promise<void> {
    await this.DeductionModel.deleteMany({
      _id: {
        $in: ids.map((_id) => new mongoose.Types.ObjectId(_id)),
      },
    });
  }
}
