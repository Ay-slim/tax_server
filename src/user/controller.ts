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
import { Contributions } from 'src/utils/types/taxDeduction';

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
  async fetchCountries() {
    const serviceResponse = await this.userService.fetchCountries();
    // console.log(serviceResponse);
    return serviceResponse;
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('userContrib')
  async fetchUserContributions(userContribDto: {
    user_id: string;
    country_id: string;
  }): Promise<Contributions[]> {
    const { user_id, country_id } = userContribDto;
    return this.userService.fetchUserContributionsRates(user_id, country_id);
  }

  @Delete('userContrib')
  async deleteUserContributions(userContribDto: {
    user_id: string;
    country_id: string;
  }): Promise<void> {
    const { user_id, country_id } = userContribDto;
    return this.userService.deleteUserContributionsRates(user_id, country_id);
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
