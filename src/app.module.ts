import { Module } from '@nestjs/common';
import { UserModule } from './user/module';
import { CountryModule } from './country/module';

@Module({
  imports: [UserModule, CountryModule],
})
export class AppModule {}
