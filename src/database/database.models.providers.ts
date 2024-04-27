import { Connection } from 'mongoose';
import { Country } from './schemas/country';
import { Summary } from './schemas/summary';
import { User } from './schemas/user';

export const CountryProviders = [
  {
    provide: 'COUNTRY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Country', Country),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const DeductionProviders = [
  {
    provide: 'DEDUCTION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Deduction', Country),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const SummaryProviders = [
  {
    provide: 'SUMMARY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Summary', Summary),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const UserProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) => connection.model('User', User),
    inject: ['DATABASE_CONNECTION'],
  },
];
