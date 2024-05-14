import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Country, CreateCountryDto } from './types';

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
}
