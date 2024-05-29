import { Module } from '@nestjs/common';
import { UserModule } from './user/module';
import { CountryModule } from './country/module';
import { DeductionModule } from './tax_deduction/module';
import { SummaryModule } from './summary/module';

@Module({
  imports: [UserModule, CountryModule, DeductionModule, SummaryModule],
})
export class AppModule {}
