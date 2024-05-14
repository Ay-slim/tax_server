export class CreateDeductionDto {
  readonly user_id: string;
  readonly description: string;
  readonly income: number;
  readonly year: number;
  readonly country_id: string;
}

export class idArgDto {
  readonly _id: string;
}
