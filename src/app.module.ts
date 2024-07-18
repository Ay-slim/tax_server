import { Module } from '@nestjs/common';
import { UserModule } from './user/module';
import { CountryModule } from './country/module';
import { FilingModule } from './tax_filing/module';
import { SummaryModule } from './summary/module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    UserModule,
    CountryModule,
    FilingModule,
    SummaryModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
