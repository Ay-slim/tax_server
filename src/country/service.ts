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

  async findAll(): Promise<Country[]> {
    return this.countryModel.find().exec();
  }

  async deleteById(_id: string): Promise<void> {
    await this.countryModel.findByIdAndDelete(_id);
  }
}
