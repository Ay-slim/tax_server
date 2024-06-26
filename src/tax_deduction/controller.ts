import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { DeductionService } from './service';
import { CreateDeductionDto, idArgDto } from './types';
import { Deduction } from 'src/database/schema.types';

@Controller('deduction')
export class DeductionController {
  constructor(private readonly deductionService: DeductionService) {}

  @Post()
  async create(@Body() createDeductionDto: CreateDeductionDto) {
    return this.deductionService.create(createDeductionDto);
  }

  @Get()
  async findAll(): Promise<Deduction[]> {
    return this.deductionService.findAll();
  }

  @Delete()
  async deleteById(@Param() deleteSummaryDto: idArgDto): Promise<void> {
    return this.deductionService.deleteById(deleteSummaryDto._id);
  }
}
