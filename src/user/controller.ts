import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { UserService } from './service';
import { CreateUserDto, idArgDto } from './types';
import { User } from 'src/database/schema.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Delete()
  async deleteById(@Param() deleteSummaryDto: idArgDto): Promise<void> {
    return this.userService.deleteById(deleteSummaryDto._id);
  }
}
