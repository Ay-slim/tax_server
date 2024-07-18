export class CreateFilingDto {
  readonly user_id: string;
  readonly description: string;
  readonly income: number;
  readonly date: string;
  readonly country_id: string;
}

export class idArgDto {
  readonly _id: string;
}
