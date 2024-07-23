import mongoose, { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateFilingDto } from './types';
import {
  Country,
  Filing,
  Summary,
  UserCountry,
} from '../database/schema.types';
// import { taxComp } from '../utils/taxComputation';
import taxCompLogic from '../utils/tax_computation_logic_by_country';
import { AmReasonDescr } from 'src/utils/types/taxDeduction';
// import nigeria from '../utils/tax_computation_logic_by_country/nigeria';

@Injectable()
export class FilingService {
  constructor(
    @Inject('FILING_MODEL')
    private FilingModel: Model<Filing>,
    @Inject('SUMMARY_MODEL')
    private SummaryModel: Model<Summary>,
    @Inject('COUNTRY_MODEL')
    private CountryModel: Model<Country>,
    @Inject('USER_COUNTRY_MODEL')
    private UserCountryModel: Model<UserCountry>,
  ) {}

  async create(createFilingDto: CreateFilingDto): Promise<Filing> {
    const {
      user_id,
      description,
      amount,
      date,
      country_id,
      country,
      category,
      contributions,
    } = createFilingDto;
    const year = new Date(date).getFullYear();
    // console.log(summary, 'SUMMARYYY');
    const { tax_brackets } = await this.CountryModel.findById(
      country_id,
      'tax_brackets',
    );
    // console.log(country, 'COUNTRYYYYY');
    const { contributions: contribution_rules } =
      await this.UserCountryModel.findOne(
        {
          user_id,
          country_id,
        },
        'contributions',
      );
    const filings = await this.FilingModel.find(
      {
        user_id,
        country_id,
      },
      'amount category description contributions',
    );
    const {
      totalIncome,
      taxes,
      taxableIncome,
      deductions,
      currentBandIndex,
      currentBracket,
    }: {
      totalIncome: number;
      taxes: AmReasonDescr[];
      taxableIncome: number;
      deductions: AmReasonDescr[];
      currentBandIndex: number;
      currentBracket: string;
    } = taxCompLogic[country.toLowerCase()]({
      contributionRules: contribution_rules,
      filings: [
        ...JSON.parse(JSON.stringify(filings)),
        {
          amount,
          category,
          description,
          contributions,
        },
      ],
      brackets: tax_brackets,
    });
    const filing = await this.FilingModel.create({
      user_id,
      description,
      amount,
      country_id,
      date: new Date(date),
      contributions,
      category,
    });

    await this.SummaryModel.findOneAndUpdate(
      {
        user_id,
        country_id,
        year,
      },
      {
        total_income: totalIncome,
        total_taxed_income: taxableIncome,
        total_deducted_tax: taxes.reduce((acc, curr) => acc + curr.amount, 0),
        current_tax_index: currentBandIndex,
        current_tax_bracket: currentBracket,
        taxes,
        deductions,
      },
      { upsert: true },
    );
    return filing;
  }

  async findAll(): Promise<Filing[]> {
    return this.FilingModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.FilingModel.findByIdAndDelete(_id);
  }

  async deleteMany(ids: Array<string>): Promise<void> {
    await this.FilingModel.deleteMany({
      _id: {
        $in: ids.map((_id) => new mongoose.Types.ObjectId(_id)),
      },
    });
  }
}
