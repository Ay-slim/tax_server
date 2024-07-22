import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { taxComp } from './utils/taxComputation';
import { computeTax } from './utils/agnosticTaxComputation';
import { CountryController } from './country/controller';
import { CountryService } from './country/service';
import { SummaryController } from './summary/controller';
import { SummaryService } from './summary/service';
import { FilingController } from './tax_filing/controller';
import { FilingService } from './tax_filing/service';
import {
  CountryProviders,
  SummaryProviders,
  UserProviders,
  FilingProviders,
} from './database/database.models.providers';
import { DatabaseModule } from './database/database.module';
import { UserController } from './user/controller';
import { UserService } from './user/service';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import Nigeria from '../src/utils/deduction_logic_by_country/nigeria';
import { FilingCategories } from './utils/types/taxDeduction';

const brackets = [
  {
    bracket: 'f',
    limit: 300000,
    rate: 0.07,
  },
  {
    bracket: 'e',
    limit: 600000,
    rate: 0.11,
  },
  {
    bracket: 'd',
    limit: 1100000,
    rate: 0.15,
  },
  {
    bracket: 'c',
    limit: 1600000,
    rate: 0.19,
  },
  {
    bracket: 'b',
    limit: 3200000,
    rate: 0.21,
  },
  {
    bracket: 'a',
    limit: 0,
    rate: 0.24,
  },
];

describe('AppController', () => {
  let appController: AppController;
  let countryController: CountryController;
  let userController: UserController;
  let summaryController: SummaryController;
  let filingController: FilingController;
  let countryId: string;
  let userId: string;
  let summaryIds: Array<string>;
  const filingIds: Array<string> = [];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, ConfigModule.forRoot()],
      controllers: [
        AppController,
        CountryController,
        UserController,
        SummaryController,
        FilingController,
      ],
      providers: [
        AppService,
        CountryService,
        ...CountryProviders,
        UserService,
        ...UserProviders,
        SummaryService,
        ...SummaryProviders,
        FilingService,
        ...FilingProviders,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    countryController = app.get<CountryController>(CountryController);
    userController = app.get<UserController>(UserController);
    summaryController = app.get<SummaryController>(SummaryController);
    filingController = app.get<FilingController>(FilingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('testTaxComp', () => {
    it('should calculate tax correctly for the first 200,000', async () => {
      const first200 = await taxComp(200000, 0, 0, brackets);
      expect(first200.grossTaxedIncome).toBe(200000);
      expect(first200.newlyDeductedTax).toBeCloseTo(14000);
      expect(first200.newBandIndex).toBe(0);
      expect(first200.currentBracket).toBe('f');
    });

    it('should calculate tax correctly for the first 200,000 on agnostic comp', async () => {
      const first200 = await computeTax(200000, brackets);
      expect(first200.taxedIncome).toBe(200000);
      expect(first200.tax).toBeCloseTo(14000);
      expect(first200.currentBandIndex).toBe(0);
      expect(first200.currentBracket).toBe('f');
    });

    it('should calculate tax correctly for the next 1,000,000', async () => {
      const nextMillion = await taxComp(1000000, 200000, 0, brackets);
      expect(nextMillion.grossTaxedIncome).toBe(1200000);
      expect(nextMillion.newlyDeductedTax).toBeCloseTo(134000);
      expect(nextMillion.newBandIndex).toBe(3);
      expect(nextMillion.currentBracket).toBe('c');
      // console.log(await taxComp(900000, 0, 0, brackets));
    });

    it('should calculate tax correctly for 5,000,000', async () => {
      const testUpperLimit = await taxComp(5000000, 0, 0, brackets);
      expect(testUpperLimit.grossTaxedIncome).toBe(5000000);
      expect(testUpperLimit.newlyDeductedTax).toBe(992000);
      expect(testUpperLimit.newBandIndex).toBe(5);
      expect(testUpperLimit.currentBracket).toBe('a');
    });

    it('should calculate tax correctly for 5,000,000 on agnostic comp', async () => {
      const testUpperLimit = await computeTax(5000000, brackets);
      expect(testUpperLimit.taxedIncome).toBe(5000000);
      expect(testUpperLimit.tax).toBe(992000);
      expect(testUpperLimit.currentBandIndex).toBe(5);
      expect(testUpperLimit.currentBracket).toBe('a');
    });
  });

  describe('Deduction logic by country', () => {
    const contributionRules = [
      {
        name: 'pension',
        percentage: 8,
      },
      {
        name: 'nhf',
        percentage: 2.5,
      },
    ];
    const filings = [
      {
        amount: 4000000,
        category: 'regular_income' as FilingCategories,
        description: 'Annual salary',
        contributions: ['pension'],
      },
    ];
    it('Should test with pwc example (4,000,000 income)', () => {
      const { taxes, taxableIncome, deductions } = Nigeria({
        contributionRules,
        filings,
        brackets,
      });
      // console.log(taxes, taxableIncome, deductions, 'NIGERIA RESULTTTT');
      expect(taxes.reduce((acc, curr) => curr.amount + acc, 0)).toBe(464240);
      expect(taxableIncome).toBe(2744000);
      expect(deductions.length).toBe(2);
    });
  });

  describe('Country module test', () => {
    it('Should create a country', async () => {
      const newCountry = await countryController.create({
        name: 'Test Country',
        currency: 'Test currency',
        tax_brackets: brackets,
        possible_contributions: ['pension', 'nhf'],
      });
      countryId = newCountry.id;
      expect(typeof countryId).toBe('string');
      expect(newCountry.name).toBe('Test Country');
      expect(newCountry.tax_brackets[0].bracket).toBe('f');
      expect(newCountry.possible_contributions).toContain('pension');
    });
  });

  it('Should test countries list fetch', async () => {
    const countries = await userController.fetchCountries();
    expect(countries.length).toBeGreaterThanOrEqual(1);
    expect(
      countries.filter((count) => count.name === 'Test Country').length,
    ).toBeGreaterThanOrEqual(1);
  });

  describe('User module test', () => {
    it('Should create a user and the default summary document', async () => {
      const newUser = await userController.create({
        name: 'Test User',
        email: 'test@user.com',
        country_id: countryId,
        year: 2024,
        password: 'test-password',
        contributions: [
          {
            name: 'pension',
            percentage: 8,
          },
        ],
      });
      userId = newUser._id;
      const summaries = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
      });
      const contributions = await userController.fetchUserContributions({
        user_id: userId,
        country_id: countryId,
      });
      // summaryIds = summaries.map((summary) => summary._id);
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('test@user.com');
      expect(summaries[0]?.total_taxed_income).toBe(0);
      expect(contributions.length).toBe(1);
      expect(contributions[0].name).toBe('pension');
      expect(contributions[0].percentage).toBe(8);
    });
    it('Should test a successful user login', async () => {
      const loggedInUser = await userController.login({
        email: 'test@user.com',
        password: 'test-password',
      });
      expect(loggedInUser.user.name).toBe('Test User');
      expect(loggedInUser.user.email).toBe('test@user.com');
      expect(loggedInUser.user._id).toEqual(new Types.ObjectId(userId));
    });
    it('Should throw for an invalid password', async () => {
      try {
        await userController.login({
          email: 'test@user.com',
          password: 'test-passweeerd',
        });
      } catch (e) {
        expect(e?.message).toBe('Invalid email or password');
      }
    });
    it('Should throw for a non existent user', async () => {
      try {
        await userController.login({
          email: 'Invalid email',
          password: 'test-passweeerd',
        });
      } catch (e) {
        expect(e?.message).toBe('Invalid email or password');
      }
    });
  });

  describe('Filing module tests', () => {
    it('Should create a tax filing and update the corresponding summary document', async () => {
      const filing24 = await filingController.create({
        user_id: userId,
        description: 'Test filing',
        income: 200000,
        date: '05-09-2024',
        country_id: countryId,
      });
      filingIds.push(filing24._id);

      const filing23 = await filingController.create({
        user_id: userId,
        description: 'Test filing 2',
        income: 200000,
        date: '05-09-2023',
        country_id: countryId,
      });
      filingIds.push(filing23._id);
      const summaries = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
      });
      summaryIds = summaries.map((summary) => summary._id);
      expect(filing24.description).toBe('Test filing');
      expect(filing24.date.getFullYear()).toBe(2024);
      expect(summaries[0]?.total_taxed_income).toBe(filing24.income);
      expect(filing24.tax).toBeCloseTo(14000);
    });
  });

  describe('Dashboard test', () => {
    it('Should fetch dashboard data and correctly filter deductions by year', async () => {
      const dashboardData = await userController.fetchDashboard({
        query: {
          year: '2024',
          user_id: userId,
        },
      } as unknown as Request);
      // console.log(dashboardData, 'DASHBOARD DATAAAAAAA');
      expect(dashboardData.filings.length).toBe(1);
      expect(dashboardData.years.length).toBe(2);
    });
  });
  afterAll(async () => {
    await countryController.deleteById({ _id: countryId });
    await userController.deleteById({ _id: userId });
    await summaryController.deleteMany(summaryIds);
    await filingController.deleteMany(filingIds);
    await userController.deleteUserContributions({
      user_id: userId,
      country_id: countryId,
    });
  });
});
