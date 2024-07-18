import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { taxComp } from './utils/taxComputation';
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
  let deductionController: FilingController;
  let countryId: string;
  let userId: string;
  let summaryIds: Array<string>;
  const deductionIds: Array<string> = [];

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
    deductionController = app.get<FilingController>(FilingController);
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

    it('should calculate tax correctly for the next 1,000,000', async () => {
      const nextMillion = await taxComp(1000000, 200000, 0, brackets);
      expect(nextMillion.grossTaxedIncome).toBe(1200000);
      expect(nextMillion.newlyDeductedTax).toBeCloseTo(134000);
      expect(nextMillion.newBandIndex).toBe(3);
      expect(nextMillion.currentBracket).toBe('c');
      // console.log(await taxComp(900000, 0, 0, brackets));
    });

    it('should calculate tax correctly for 5,000,000', async () => {
      // const first900 = await taxComp(5000000, 0, 0, brackets);
      // expect(first900.grossTaxedIncome).toBe(900000);
      // expect(first900.newlyDeductedTax).toBe(87000);
      // expect(first900.newBandIndex).toBe(2);
      // expect(first900.currentBracket).toBe('d');
      const testUpperLimit = await taxComp(5000000, 0, 0, brackets);
      expect(testUpperLimit.grossTaxedIncome).toBe(5000000);
      expect(testUpperLimit.newlyDeductedTax).toBe(992000);
      expect(testUpperLimit.newBandIndex).toBe(5);
      expect(testUpperLimit.currentBracket).toBe('a');
    });
  });

  describe('Country module test', () => {
    it('Should create a country', async () => {
      const newCountry = await countryController.create({
        name: 'Test Country',
        currency: 'Test currency',
        tax_brackets: brackets,
      });
      countryId = newCountry.id;
      expect(typeof countryId).toBe('string');
      expect(newCountry.name).toBe('Test Country');
      expect(newCountry.tax_brackets[0].bracket).toBe('f');
    });
  });

  describe('User module test', () => {
    it('Should create a user and the default summary document', async () => {
      const newUser = await userController.create({
        name: 'Test User',
        email: 'test@user.com',
        country_id: countryId,
        year: 2024,
        password: 'test-password',
        pension_contribution_percent: 8,
      });
      userId = newUser._id;
      const summaries = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
      });
      // summaryIds = summaries.map((summary) => summary._id);
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('test@user.com');
      expect(summaries[0]?.total_taxed_income).toBe(0);
      expect(summaries[0]?.pension_contribution_percent).toBe(8);
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
    it('Should create a deduction and update the corresponding summary document', async () => {
      const filing24 = await deductionController.create({
        user_id: userId,
        description: 'Test deduction',
        income: 200000,
        date: '05-09-2024',
        country_id: countryId,
      });
      deductionIds.push(filing24._id);

      const filing23 = await deductionController.create({
        user_id: userId,
        description: 'Test deduction 2',
        income: 200000,
        date: '05-09-2023',
        country_id: countryId,
      });
      deductionIds.push(filing23._id);
      const summaries = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
      });
      summaryIds = summaries.map((summary) => summary._id);
      expect(filing24.description).toBe('Test deduction');
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
    await deductionController.deleteMany(deductionIds);
  });
});
