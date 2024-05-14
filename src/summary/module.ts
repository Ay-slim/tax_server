import { Module } from '@nestjs/common';
import { SummaryController } from './controller';
import { SummaryService } from './service';
import { SummaryProviders } from '../database/database.models.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SummaryController],
  providers: [SummaryService, ...SummaryProviders],
})
export class SummaryModule {}
