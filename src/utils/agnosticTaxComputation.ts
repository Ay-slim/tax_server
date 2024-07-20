import { TaxBrackets } from './types/taxDeduction';

export const computeTax = async (
  newIncome: number,
  brackets: TaxBrackets[],
) => {
  let virtualIncomeTaxed = 0;
  let virtualTaxAmount = 0;
  let newBandIndex = 0;
  let amountToTax = 0;
  for (let bracketIndex = 0; bracketIndex < brackets.length; bracketIndex++) {
    let shouldBreak = false;
    if (!brackets[bracketIndex].limit) {
      // The current tax bracket is the maximum tax bracket where there's no upper limit (represented by 0 in the DB)
      amountToTax = newIncome - virtualIncomeTaxed;
      shouldBreak = true;
    } else if (newIncome > brackets[bracketIndex].limit) {
      // Income exceeds the current tax bracket's upper limit
      amountToTax = brackets[bracketIndex].limit - virtualIncomeTaxed;
    } else {
      // Income is below the current tax bracket's upper limit
      amountToTax = newIncome - virtualIncomeTaxed;
      shouldBreak = true;
    }
    virtualTaxAmount += amountToTax * brackets[bracketIndex].rate;
    virtualIncomeTaxed += amountToTax;
    newBandIndex = bracketIndex;
    if (shouldBreak) {
      break;
    }
  }
  return {
    taxedIncome: virtualIncomeTaxed,
    tax: virtualTaxAmount,
    currentBracket: brackets[newBandIndex].bracket,
    currentBandIndex: newBandIndex,
  };
};
