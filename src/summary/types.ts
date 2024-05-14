export class CreateSummaryDto {
  readonly name: string;
  readonly currency: string;
  readonly tax_brackets: {
    bracket: string;
    rate: number;
    limit: number;
  }[];
}

export class idArgDto {
  readonly _id: string;
}
