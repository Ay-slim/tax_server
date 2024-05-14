import { Connection } from 'mongoose';
import { Country } from './schemas/country';
import { Summary } from './schemas/summary';
import { User } from './schemas/user';
import { Deduction } from './schemas/deduction';

const CountryModel = {
  provide: 'COUNTRY_MODEL',
  useFactory: (connection: Connection) => connection.model('Country', Country),
  inject: ['DATABASE_CONNECTION'],
};

const DeductionModel = {
  provide: 'DEDUCTION_MODEL',
  useFactory: (connection: Connection) =>
    connection.model('Deduction', Deduction),
  inject: ['DATABASE_CONNECTION'],
};

const SummaryModel = {
  provide: 'SUMMARY_MODEL',
  useFactory: (connection: Connection) => connection.model('Summary', Summary),
  inject: ['DATABASE_CONNECTION'],
};

const UserModel = {
  provide: 'USER_MODEL',
  useFactory: (connection: Connection) => connection.model('User', User),
  inject: ['DATABASE_CONNECTION'],
};

export const CountryProviders = [CountryModel];

export const DeductionProviders = [DeductionModel, SummaryModel, CountryModel];

export const UserProviders = [UserModel, SummaryModel];

export const SummaryProviders = [SummaryModel];
