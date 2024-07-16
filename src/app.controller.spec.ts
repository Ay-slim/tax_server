import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { taxComp } from './utils/taxComputation';
import { CountryController } from './country/controller';
import { CountryService } from './country/service';
import { SummaryController } from './summary/controller';
import { SummaryService } from './summary/service';
import { DeductionController } from './tax_deduction/controller';
import { DeductionService } from './tax_deduction/service';
import {
  CountryProviders,
  SummaryProviders,
  UserProviders,
  DeductionProviders,
} from './database/database.models.providers';
import { DatabaseModule } from './database/database.module';
import { UserController } from './user/controller';
import { UserService } from './user/service';
import { Request } from 'express';

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
  let deductionController: DeductionController;
  let countryId: string;
  let userId: string;
  let summaryIds: Array<string>;
  const deductionIds: Array<string> = [];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [
        AppController,
        CountryController,
        UserController,
        SummaryController,
        DeductionController,
      ],
      providers: [
        AppService,
        CountryService,
        ...CountryProviders,
        UserService,
        ...UserProviders,
        SummaryService,
        ...SummaryProviders,
        DeductionService,
        ...DeductionProviders,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    countryController = app.get<CountryController>(CountryController);
    userController = app.get<UserController>(UserController);
    summaryController = app.get<SummaryController>(SummaryController);
    deductionController = app.get<DeductionController>(DeductionController);
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
        email: 'Test User email',
        country_id: countryId,
        year: 2024,
        password: 'test-password',
      });
      userId = newUser._id;
      const summaries = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
      });
      // summaryIds = summaries.map((summary) => summary._id);
      expect(newUser.name).toBe('Test User');
      expect(newUser.email).toBe('Test User email');
      expect(summaries[0]?.total_taxed_income).toBe(0);
    });
  });

  describe('Deduction module tests', () => {
    it('Should create a deduction and update the corresponding summary document', async () => {
      const deduction24 = await deductionController.create({
        user_id: userId,
        description: 'Test deduction',
        income: 200000,
        date: '05-09-2024',
        country_id: countryId,
      });
      deductionIds.push(deduction24._id);

      const deduction23 = await deductionController.create({
        user_id: userId,
        description: 'Test deduction 2',
        income: 200000,
        date: '05-09-2023',
        country_id: countryId,
      });
      deductionIds.push(deduction23._id);
      const summaries = await summaryController.findByUserAndCountry({
        user_id: userId,
        country_id: countryId,
      });
      summaryIds = summaries.map((summary) => summary._id);
      expect(deduction24.description).toBe('Test deduction');
      expect(deduction24.date.getFullYear()).toBe(2024);
      expect(summaries[0]?.total_taxed_income).toBe(deduction24.income);
      expect(deduction24.tax).toBeCloseTo(14000);
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
      expect(dashboardData.deductions.length).toBe(1);
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
