import { Connection } from 'mongoose';
import { Country } from './schemas/country';
import { Summary } from './schemas/summary';
import { User } from './schemas/user';
import { Filing } from './schemas/filing';

const CountryModel = {
  provide: 'COUNTRY_MODEL',
  useFactory: (connection: Connection) => connection.model('Country', Country),
  inject: ['DATABASE_CONNECTION'],
};

const FilingModel = {
  provide: 'FILING_MODEL',
  useFactory: (connection: Connection) => connection.model('Filing', Filing),
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

export const FilingProviders = [FilingModel, SummaryModel, CountryModel];

export const UserProviders = [
  UserModel,
  SummaryModel,
  FilingModel,
  CountryModel,
];

export const SummaryProviders = [SummaryModel];
