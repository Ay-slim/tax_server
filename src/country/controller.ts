import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { CountryService } from './service';
import { CreateCountryDto, DeleteCountryDto } from './types';
import { Country } from '../database/schema.types';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  async create(@Body() createCountryDto: CreateCountryDto): Promise<Country> {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  async findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }

  @Delete()
  async deleteById(@Param() deleteCountryDto: DeleteCountryDto): Promise<void> {
    return this.countryService.deleteById(deleteCountryDto._id);
  }
}
