import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { MediaReader, UploadSigner } from "../../application/ports";
import type { Asset, SignedUpload } from "../../domain/media";

/** Phase 5: POST /v1/uploads/sign — objects stay private. Public ACL is forbidden. */
export class MediaHttpGateway implements MediaReader, UploadSigner {
  constructor(private readonly http: BackendGateway) {}

  getById(): Promise<Asset> {
    return this.notReady("media.getById");
  }

  sign(): Promise<SignedUpload> {
    return this.notReady("media.sign");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
