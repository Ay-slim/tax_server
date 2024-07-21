import { Filings, TaxBrackets } from '../types/taxDeduction';
import { computeTax } from '../agnosticTaxComputation';

type AmReasonDescr = {
  amount: number;
  reason: string;
  description: string;
};

const nigeria = ({
  contributionRules,
  filings,
  brackets,
}: {
  contributionRules: {
    name: string;
    percentage: number;
  }[];
  filings: Filings[];
  brackets: TaxBrackets[];
}) => {
  const deductions: AmReasonDescr[] = [];
  const taxes: AmReasonDescr[] = [];
  let capital_gains_income = 0;
  let gross_income_less_deductions = 0;
  const contributionsMap: {
    [key: string]: AmReasonDescr;
  } = {};
  contributionRules.forEach((contrib) => {
    contributionsMap[contrib.name] = {
      amount: 0,
      reason: `${contrib.name} contribution`,
      description: contrib.name,
    };
  });
  filings.forEach((filing) => {
    if (filing.category === 'investment_income') {
      deductions.push({
        amount: filing.amount,
        reason: 'Investment income',
        description: filing.description,
      });
      return;
    } else if (filing.category === 'capital_gain') {
      taxes.push({
        amount: filing.amount * 0.1,
        reason: 'Capital gains tax',
        description: filing.description,
      });
      capital_gains_income += filing.amount;
      return;
    } else if (filing.category === 'regular_income') {
      if (filing.contributions.length) {
        filing.contributions.forEach((contribution) => {
          const contributionRule = contributionRules.filter(
            (cR) => cR.name === contribution,
          );
          contributionsMap[contribution].amount +=
            (filing.amount * contributionRule[0].percentage) / 100;
          gross_income_less_deductions +=
            filing.amount * (1 - contributionRule[0].percentage / 100);
        });
      } else {
        gross_income_less_deductions += filing.amount;
      }
    }
  });
  const consolidated_relief =
    Math.max(200000, 0.01 * gross_income_less_deductions) +
    0.2 * gross_income_less_deductions;
  deductions.push({
    amount: consolidated_relief,
    reason: 'Consolidated relief',
    description:
      'Higher of NGN 200,000 or 1% of gross income plus 20% of gross income',
  });
  const final_amount_to_tax =
    gross_income_less_deductions - consolidated_relief;
  const { tax, currentBandIndex, currentBracket } = computeTax(
    final_amount_to_tax,
    brackets,
  );
  taxes.push({
    amount: tax,
    reason: 'Personal income tax',
    description: 'Tax on remaining taxable income after reliefs and deductions',
  });
  const contributionDeductions = Object.values(contributionsMap).filter(
    (cMap) => cMap.amount > 0,
  );
  return {
    taxes,
    taxableIncome: final_amount_to_tax + capital_gains_income,
    deductions: [...deductions, ...contributionDeductions],
    currentBandIndex,
    currentBracket,
  };
};

export default nigeria;
