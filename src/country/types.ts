export class CreateCountryDto {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
}

export class DeleteCountryDto {
  readonly _id: string;
}
