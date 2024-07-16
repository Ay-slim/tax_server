import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { CountryService } from './service';
import { CreateCountryDto, DeleteCountryDto } from './types';
import { Request } from 'express';
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

  @Get('brackets')
  async fetchTaxBrackets(@Req() request: Request): Promise<string[]> {
    const fetchBracketsDto = JSON.parse(JSON.stringify(request.query));
    return (await this.countryService.fetchBrackets(fetchBracketsDto._id)).map(
      (brack) => brack?.bracket,
    );
  }

  @Delete()
  async deleteById(@Param() deleteCountryDto: DeleteCountryDto): Promise<void> {
    return this.countryService.deleteById(deleteCountryDto._id);
  }
}
