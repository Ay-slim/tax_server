export type Filings = {
  amount: number;
  category: 'regular_income' | 'capital_gain' | 'investment_income';
  description: string;
  contributions: string[];
};

type NameAndAmount = {
  name: string;
  amount: number;
  reason: string;
};

export type DeductionReturn = {
  deductions: NameAndAmount[];
  taxes: NameAndAmount[];
};

export type TaxBrackets = {
  bracket: string;
  limit: number;
  rate: number;
};
