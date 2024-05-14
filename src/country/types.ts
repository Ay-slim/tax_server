export interface Country extends Document {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
}

export class CreateCountryDto {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
}
