import { Module } from '@nestjs/common';
import { CountryController } from './controller';
import { CountryService } from './service';
import { CountryProviders } from '../database/database.models.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CountryController],
  providers: [CountryService, ...CountryProviders],
})
export class CountryModule {}
