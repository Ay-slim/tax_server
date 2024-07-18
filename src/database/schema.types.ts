import { Document } from 'mongoose';

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
}

export interface Filing extends Document {
  date: any;
  readonly user_id: string;
  readonly description: string;
  readonly income: number;
  readonly year: number;
  readonly country_id: string;
  readonly tax: number;
}

export interface Summary extends Document {
  readonly user_id: string;
  readonly year: number;
  readonly country_id: string;
  readonly total_taxed_income: number;
  readonly total_deducted_tax: number;
  readonly current_tax_index: number;
  readonly pension_contribution_percent: number;
}
