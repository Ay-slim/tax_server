export class CreateCountryDto {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
  readonly possible_contributions: string[];
}

export class DeleteCountryDto {
  readonly _id: string;
}

export class FetchBracketsDto {
  readonly _id: string;
}
