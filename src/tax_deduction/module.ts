import { Module } from '@nestjs/common';
import { DeductionController } from './controller';
import { DeductionService } from './service';
import { DeductionProviders } from '../database/database.models.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeductionController],
  providers: [DeductionService, ...DeductionProviders],
})
export class DeductionModule {}
