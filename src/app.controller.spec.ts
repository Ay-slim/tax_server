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
import Nigeria from './utils/tax_computation_logic_by_country/nigeria';
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
  let userId2: string;
  const summaryIds: Array<string> = [];
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
      const {
        taxes,
        taxableIncome,
        deductions,
        totalIncome,
        currentBandIndex,
      } = Nigeria({
        contributionRules,
        filings,
        brackets,
      });
      // console.log(taxes, taxableIncome, deductions, 'NIGERIA RESULTTTT');
      expect(taxes.reduce((acc, curr) => curr.amount + acc, 0)).toBe(464240);
      expect(taxableIncome).toBe(2744000);
      expect(deductions.length).toBe(2);
      expect(totalIncome).toBe(4000000);
      expect(currentBandIndex).toBe(4);
    });
  });

  describe('Country module test', () => {
    it('Should create a country', async () => {
      const newCountry = await countryController.create({
        name: 'Nigeria',
        currency: 'Test currency',
        tax_brackets: brackets,
        possible_contributions: ['pension', 'nhf'],
      });
      countryId = newCountry.id;
      expect(typeof countryId).toBe('string');
      expect(newCountry.name).toBe('Nigeria');
      expect(newCountry.tax_brackets[0].bracket).toBe('f');
      expect(newCountry.possible_contributions).toContain('pension');
    });
  });

  it('Should test countries list fetch', async () => {
    const countries = await userController.fetchCountries();
    expect(countries.length).toBeGreaterThanOrEqual(1);
    expect(
      countries.filter((count) => count.name === 'Nigeria').length,
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
          {
            name: 'nhf',
            percentage: 2.5,
          },
        ],
      });
      userId = newUser._id;

      const newUser2 = await userController.create({
        name: 'Test User 2',
        email: 'test2@user.com',
        country_id: countryId,
        year: 2024,
        password: 'test2-password',
        contributions: [
          {
            name: 'pension',
            percentage: 8,
          },
          {
            name: 'nhf',
            percentage: 2.5,
          },
        ],
      });
      userId2 = newUser2._id;

      const summary = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
        year: 2024,
      });
      const contributions = await userController.fetchUserContributions({
        query: {
          user_id: userId,
          country_id: countryId,
        },
      } as unknown as Request);
      // summaryIds = summaries.map((summary) => summary._id);
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('test@user.com');
      expect(summary?.total_taxed_income).toBe(0);
      expect(contributions.length).toBe(2);
      expect(contributions).toContain('nhf');
      expect(contributions).toContain('pension');
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
        amount: 200000,
        date: '05-09-2024',
        country_id: countryId,
        category: 'regular_income',
        contributions: ['pension'],
      });
      filingIds.push(filing24._id);
      expect(filing24.description).toBe('Test filing');
      const summary24 = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
        year: 2024,
      });
      summaryIds.push(summary24._id);
      expect(summary24.total_income).toBe(200000);
      expect(summary24.total_taxed_income).toBe(0);
      expect(summary24.taxes.length).toBe(0);
      expect(summary24.deductions.length).toBe(2);

      const filing24b = await filingController.create({
        user_id: userId,
        description: 'Test filing 2',
        amount: 200000,
        date: '05-09-2024',
        country_id: countryId,
        category: 'regular_income',
        contributions: ['pension'],
      });
      filingIds.push(filing24b._id);
      const summary24b = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
        year: 2024,
      });
      expect(summary24b.total_income).toBe(400000);
      expect(summary24b.total_taxed_income).toBe(94400);
      expect(summary24b.taxes.length).toBe(1);
      expect(summary24b.total_deducted_tax).toBeCloseTo(6608);
      expect(summary24b.deductions.length).toBe(2);
    });
    it('Should test a filing with multiple deductions', async () => {
      const filingDouble = await filingController.create({
        user_id: userId2,
        description: 'Test filing 3',
        amount: 800000,
        date: '05-09-2024',
        country_id: countryId,
        category: 'regular_income',
        contributions: ['pension', 'nhf'],
      });
      filingIds.push(filingDouble._id);
      const summaryDouble = await summaryController.findByUserAndCountry({
        user_id: userId2,
        country_id: countryId,
        year: 2024,
      });
      summaryIds.push(summaryDouble._id);
      expect(summaryDouble.total_income).toBe(800000);
      expect(summaryDouble.total_taxed_income).toBe(372800);
      expect(summaryDouble.taxes.length).toBe(1);
      expect(summaryDouble.deductions.length).toBe(3);
      expect(summaryDouble.total_deducted_tax).toBeCloseTo(29008);
    });
  });

  describe('Dashboard test', () => {
    it('Should fetch dashboard data and correctly filter deductions by year', async () => {
      const filing23 = await filingController.create({
        user_id: userId,
        description: 'Test filing 2',
        amount: 200000,
        date: '05-09-2023',
        country_id: countryId,
        category: 'regular_income',
        contributions: ['pension'],
      });
      filingIds.push(filing23._id);
      const summary23 = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
        year: 2023,
      });
      summaryIds.push(summary23._id);
      const dashboardData = await userController.fetchDashboard({
        query: {
          year: '2024',
          user_id: userId,
        },
      } as unknown as Request);
      // console.log(dashboardData, 'DASHBOARD DATAAAAAAA');
      expect(dashboardData.filings.length).toBe(2);
      expect(dashboardData.years.length).toBe(2);
    });
  });
  afterAll(async () => {
    await countryController.deleteById({ _id: countryId });
    await userController.deleteById({ _id: userId });
    await userController.deleteById({ _id: userId2 });
    await summaryController.deleteMany(summaryIds);
    await filingController.deleteMany(filingIds);
    await userController.deleteUserContributions({
      user_id: userId,
      country_id: countryId,
    });
    await userController.deleteUserContributions({
      user_id: userId2,
      country_id: countryId,
    });
  });
});
