export const taxComp = async (
  newIncome: number,
  totalTaxedIncome: number,
  currentBandIndex: number,
  brackets: { bracket: string; rate: number; limit: number }[],
) => {
  const virtualTotal = newIncome + totalTaxedIncome;
  let virtualIncomeTaxed = totalTaxedIncome;
  let virtualTaxDeduction = 0;
  let newBandIndex = 0;
  let amountToTax = 0;
  for (
    let bracketIndex = currentBandIndex;
    bracketIndex < brackets.length;
    bracketIndex++
  ) {
    let shouldBreak = false;
    if (!brackets[bracketIndex].limit) {
      amountToTax = newIncome - (virtualIncomeTaxed - totalTaxedIncome);
      shouldBreak = true;
    } else if (virtualTotal > brackets[bracketIndex].limit) {
      amountToTax = brackets[bracketIndex].limit - virtualIncomeTaxed;
    } else {
      amountToTax = virtualTotal - virtualIncomeTaxed;
      shouldBreak = true;
    }
    // console.log(
    //   amountToTax,
    //   'AMOUNT TO TAX',
    //   ': ',
    //   brackets[bracketIndex].rate,
    // );
    virtualTaxDeduction += amountToTax * brackets[bracketIndex].rate;
    virtualIncomeTaxed += amountToTax;
    newBandIndex = bracketIndex;
    if (shouldBreak) {
      break;
    }
  }
  return {
    grossTaxedIncome: virtualIncomeTaxed,
    newlyDeductedTax: virtualTaxDeduction,
    newBandIndex,
    currentBracket: brackets[newBandIndex].bracket,
  };
};
