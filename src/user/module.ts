import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { UserService } from './service';
import { UserProviders } from '../database/database.models.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ...UserProviders],
})
export class UserModule {}
