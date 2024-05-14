import { Controller, Get, Post, Body } from '@nestjs/common';
import { CountryService } from './service';
import { CreateCountryDto, Country } from './types';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  async findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }
}
