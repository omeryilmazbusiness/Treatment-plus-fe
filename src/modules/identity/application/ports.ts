import type { Membership, Session, User } from "../domain/identity";

export type Credentials = {
  email: string;
  password: string;
};

export type RegisterInput = Credentials & {
  clinicName: string;
};

export interface AuthGateway {
  login(input: Credentials): Promise<Session>;
  register(input: RegisterInput): Promise<Session>;
  logout(): Promise<void>;
  refresh(): Promise<Session>;
  currentUser(): Promise<User>;
  currentMembership(): Promise<Membership>;
}
