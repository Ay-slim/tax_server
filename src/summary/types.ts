export class CreateSummaryDto {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
}

export class UserAndCountryDto {
  readonly user_id: string;
  readonly country_id: string;
}
export class idArgDto {
  readonly _id: string;
}
