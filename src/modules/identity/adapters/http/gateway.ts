import type { BackendGateway } from "@/platform/http/types";
import { AppError } from "@/shared/errx";

import type { AuthGateway } from "../../application/ports";
import type { Membership, Session, User } from "../../domain/identity";

/** Phase 1: POST /v1/auth/{register,login,refresh,logout,invite} */
export class IdentityHttpGateway implements AuthGateway {
  constructor(private readonly http: BackendGateway) {}

  login(): Promise<Session> {
    return this.notReady("identity.login");
  }

  register(): Promise<Session> {
    return this.notReady("identity.register");
  }

  logout(): Promise<void> {
    return this.notReady("identity.logout");
  }

  refresh(): Promise<Session> {
    return this.notReady("identity.refresh");
  }

  currentUser(): Promise<User> {
    return this.notReady("identity.currentUser");
  }

  currentMembership(): Promise<Membership> {
    return this.notReady("identity.currentMembership");
  }

  private notReady(name: string): never {
    void this.http;
    throw AppError.notImplemented(name);
  }
}
