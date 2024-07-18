import { Module } from '@nestjs/common';
import { FilingController } from './controller';
import { FilingService } from './service';
import { FilingProviders } from '../database/database.models.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FilingController],
  providers: [FilingService, ...FilingProviders],
})
export class FilingModule {}
