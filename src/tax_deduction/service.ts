import { Model } from 'mongoose';
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
    const { user_id, description, income, year, country_id } =
      createDeductionDto;
    const summary = await this.SummaryModel.findOne({
      user_id,
      country_id,
    });
    const country = await this.CountryModel.findById(country_id);
    const tax = await taxComp(
      income,
      summary.total_taxed_income,
      summary.current_tax_index,
      country.tax_brackets,
    );
    console.log(income, 'INCOMEEE IN SER IDEE');
    const deduction = await this.DeductionModel.create({
      user_id,
      description,
      income,
      country_id,
      tax: tax.newlyDeductedTax,
      year,
    });
    console.log(deduction, 'DEDUCTION IN SERVICE FILEE');
    await this.SummaryModel.findOneAndUpdate(
      {
        user_id,
        country_id,
      },
      {
        total_taxed_income: summary.total_taxed_income + income,
        total_deducted_tax: summary.total_deducted_tax + tax.newlyDeductedTax,
        current_tax_index: tax.newBandIndex,
      },
    );
    return deduction;
  }

  async findAll(): Promise<Deduction[]> {
    return this.DeductionModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.SummaryModel.findByIdAndDelete(_id);
  }
}
