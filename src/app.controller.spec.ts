import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { taxComp } from './utils/taxComputation';

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

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
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
      // console.log(await taxComp(900000, 0, 0, brackets));
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
});
