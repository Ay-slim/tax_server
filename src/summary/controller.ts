import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { SummaryService } from './service';
import { CreateSummaryDto, UserAndCountryDto, idArgDto } from './types';
import { Summary } from '../database/schema.types';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post()
  async create(@Body() createSummaryDto: CreateSummaryDto): Promise<Summary> {
    return this.summaryService.create(createSummaryDto);
  }

  @Get()
  async findAll(): Promise<Summary[]> {
    return this.summaryService.findAll();
  }

  @Get()
  async findByUserAndCountry(
    @Param() findByUcDto: UserAndCountryDto,
  ): Promise<Summary> {
    return this.summaryService.findByUserAndCountry(
      findByUcDto.user_id,
      findByUcDto.country_id,
      findByUcDto.year,
    );
  }

  @Delete()
  async deleteById(@Param() deleteSummaryDto: idArgDto): Promise<void> {
    return this.summaryService.deleteById(deleteSummaryDto._id);
  }

  @Delete('/many')
  async deleteMany(@Param() deleteMultiSummaryDto: string[]): Promise<void> {
    return this.summaryService.deleteMany(deleteMultiSummaryDto);
  }
}
