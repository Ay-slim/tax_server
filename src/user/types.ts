export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly country_id: string;
  readonly password: string;
  readonly year: number;
}

export class UserDashboardDto {
  readonly user_id: string;
  readonly year: number;
}
export class idArgDto {
  readonly _id: string;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}
