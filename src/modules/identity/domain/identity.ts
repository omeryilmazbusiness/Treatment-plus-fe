import type { ID } from "@/shared/id";

export const Role = {
  Owner: "owner",
  Doctor: "doctor",
  Assistant: "assistant",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type User = {
  id: ID;
  email: string;
};

export type Clinic = {
  id: ID;
  name: string;
};

export type Membership = {
  userId: ID;
  clinicId: ID;
  role: Role;
};

export type Session = {
  userId: ID;
  clinicId: ID;
  role: Role;
};
