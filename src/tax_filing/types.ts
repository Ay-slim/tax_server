export class CreateFilingDto {
  readonly user_id: string;
  readonly description: string;
  readonly amount: number;
  readonly date: string;
  readonly country_id: string;
  readonly category: string;
  readonly contributions: string[];
}

export class idArgDto {
  readonly _id: string;
}
