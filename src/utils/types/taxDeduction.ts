export type FilingCategories =
  | 'regular_income'
  | 'capital_gain'
  | 'investment_income';

export type Filings = {
  amount: number;
  category: FilingCategories;
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

export type Contributions = {
  name: string;
  percentage: number;
};

export type AmReasonDescr = {
  amount: number;
  reason: string;
  description: string;
};
