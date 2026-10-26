import type { ID } from "@/shared/id";

import type { Asset, MediaKind, SignedUpload } from "../domain/media";

export interface MediaReader {
  getById(id: ID): Promise<Asset>;
}

export interface UploadSigner {
  sign(kind: MediaKind): Promise<SignedUpload>;
}
