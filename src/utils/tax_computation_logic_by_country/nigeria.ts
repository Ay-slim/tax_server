import { AmReasonDescr, Filings, TaxBrackets } from '../types/taxDeduction';
import { computeTax } from '../agnosticTaxComputation';

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
  let gross_income_with_deductions = 0;
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
      gross_income_less_deductions += filing.amount;
      if (filing.contributions.length) {
        // If there are contributions, deduct the contributions from the amount to tax
        filing.contributions.forEach((contribution) => {
          const contributionRule = contributionRules.filter(
            (cR) => cR.name === contribution,
          );
          const contributionAmount =
            (filing.amount * contributionRule[0].percentage) / 100;
          contributionsMap[contribution].amount += contributionAmount;
          gross_income_less_deductions -= contributionAmount;
        });
      }
      gross_income_with_deductions += filing.amount;
    }
  });
  const consolidated_relief =
    Math.max(200000, 0.01 * gross_income_with_deductions) +
    0.2 * gross_income_less_deductions;
  deductions.push({
    amount: consolidated_relief,
    reason: 'Consolidated relief',
    description:
      'Higher of NGN 200,000 or 1% of gross income plus 20% of gross income',
  });
  const final_amount_to_tax =
    gross_income_less_deductions - consolidated_relief;
  let currentBandIdx = 0;
  let currentTaxBracket = brackets[0]?.bracket;
  if (final_amount_to_tax > 0) {
    const { tax, currentBandIndex, currentBracket } = computeTax(
      final_amount_to_tax,
      brackets,
    );
    currentBandIdx = currentBandIndex;
    currentTaxBracket = currentBracket;
    taxes.push({
      amount: tax,
      reason: 'Personal income tax',
      description:
        'Tax on remaining taxable income after reliefs and deductions',
    });
  }
  const contributionDeductions = Object.values(contributionsMap).filter(
    (cMap) => cMap.amount > 0,
  );
  const taxableIncome = final_amount_to_tax + capital_gains_income;
  return {
    totalIncome: filings.reduce((acc, curr) => acc + curr.amount, 0),
    taxes,
    taxableIncome: taxableIncome > 0 ? taxableIncome : 0,
    deductions: [...deductions, ...contributionDeductions],
    currentBandIndex: currentBandIdx,
    currentBracket: currentTaxBracket,
  };
};

export default nigeria;
