import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateCountryDto } from './types';
import { Country } from '../database/schema.types';

@Injectable()
export class CountryService {
  constructor(
    @Inject('COUNTRY_MODEL')
    private countryModel: Model<Country>,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    const createdCountry = new this.countryModel(createCountryDto);
    return createdCountry.save();
  }

  async findOne(_id: string): Promise<Country> {
    return this.countryModel.findById(_id);
  }

  async fetchBrackets(_id: string): Promise<Country['tax_brackets']> {
    const country = await this.countryModel.findById(_id, 'tax_brackets');
    return country.tax_brackets;
  }

  async findAll(): Promise<Country[]> {
    return this.countryModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.countryModel.findByIdAndDelete(_id);
  }
}
