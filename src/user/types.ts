export interface User extends Document {
  readonly name: string;
  readonly email: string;
}

export class CreateUserDto {
  readonly name: string;
  readonly email: string;
}
