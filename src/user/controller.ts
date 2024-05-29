import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './service';
import {
  CreateUserDto,
  LoginUserDto,
  UserDashboardDto,
  idArgDto,
} from './types';
import { User } from 'src/database/schema.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get('countries')
  async fetch_countries() {
    return this.userService.fetchCountries();
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('dashboard')
  async fetchDashboard(@Req() request: Request) {
    const dashboardDto = JSON.parse(JSON.stringify(request.query));
    //console.log(dashboardDto);
    return this.userService.dashboard(dashboardDto as UserDashboardDto);
  }

  @Delete()
  async deleteById(@Param() deleteSummaryDto: idArgDto): Promise<void> {
    return this.userService.deleteById(deleteSummaryDto._id);
  }
}
