import { Module } from '@nestjs/common';
import { UserModule } from './user/module';
import { CountryModule } from './country/module';
import { DeductionModule } from './tax_deduction/module';
import { SummaryModule } from './summary/module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    CountryModule,
    DeductionModule,
    SummaryModule,
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
