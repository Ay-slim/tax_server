import { Document } from 'mongoose';
import { AmReasonDescr, FilingCategories } from 'src/utils/types/taxDeduction';

export interface User extends Document {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface Country extends Document {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
  readonly possible_contributions: string[];
}

export interface Filing extends Document {
  date: any;
  readonly user_id: string;
  readonly description: string;
  readonly amount: number;
  readonly year: number;
  readonly country_id: string;
  readonly category: FilingCategories;
  readonly contributions: string[];
}

export interface Summary extends Document {
  readonly user_id: string;
  readonly year: number;
  readonly country_id: string;
  readonly total_income: number;
  readonly total_taxed_income: number;
  readonly total_deducted_tax: number;
  readonly current_tax_index: number;
  readonly taxes: AmReasonDescr[];
  readonly deductions: AmReasonDescr[];
}

export interface UserCountry extends Document {
  readonly user_id: string;
  readonly country_id: string;
  readonly contributions: {
    name: string;
    percentage: number;
  }[];
}
