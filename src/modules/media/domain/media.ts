import type { ID } from "@/shared/id";

export const MediaKind = {
  Logo: "logo",
  Team: "team",
  Xray: "xray",
  Before: "before",
  After: "after",
  Video: "video",
} as const;

export type MediaKind = (typeof MediaKind)[keyof typeof MediaKind];

export type Asset = {
  id: ID;
  clinicId: ID;
  key: string;
  kind: MediaKind;
  checksum: string;
};

export type SignedUpload = {
  key: string;
  url: string;
  headers: Record<string, string>;
};
