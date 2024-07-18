import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { FilingService } from './service';
import { CreateFilingDto, idArgDto } from './types';
import { Filing } from 'src/database/schema.types';

@Controller('filing')
export class FilingController {
  constructor(private readonly deductionService: FilingService) {}

  @Post()
  async create(@Body() createDeductionDto: CreateFilingDto) {
    return this.deductionService.create(createDeductionDto);
  }

  @Get()
  async findAll(): Promise<Filing[]> {
    return this.deductionService.findAll();
  }

  @Delete()
  async deleteById(@Param() deleteSummaryDto: idArgDto): Promise<void> {
    return this.deductionService.deleteById(deleteSummaryDto._id);
  }

  @Delete('/many')
  async deleteMany(@Param() deleteMultiDeductionDto: string[]): Promise<void> {
    return this.deductionService.deleteMany(deleteMultiDeductionDto);
  }
}
