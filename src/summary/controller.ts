import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { SummaryService } from './service';
import { CreateSummaryDto, idArgDto } from './types';
import { Summary } from '../database/schema.types';

@Controller('Summary')
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
  async findByUser(@Param() findByIdDto: idArgDto): Promise<Summary> {
    return this.summaryService.findByUser(findByIdDto._id);
  }

  @Delete()
  async deleteById(@Param() deleteSummaryDto: idArgDto): Promise<void> {
    return this.summaryService.deleteById(deleteSummaryDto._id);
  }
}
