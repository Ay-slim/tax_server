import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { User, CreateUserDto } from './types';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdCat = new this.userModel(createUserDto);
    return createdCat.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
