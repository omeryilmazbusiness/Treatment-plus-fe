import { connection } from "next/server";
import { NextResponse } from "next/server";

import { getRuntime } from "@/bootstrap";
import { jsonError, statusOf } from "@/platform/http/errors";

export async function GET() {
  await connection();
  const { backend } = getRuntime();

  try {
    const api = await backend.readyz();
    const ok = api.status === "ok";
    return NextResponse.json(
      {
        status: ok ? "ok" : "not_ready",
        checks: { api: api.status, ...api.checks },
      },
      {
        status: ok ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { status: "not_ready", checks: { api: "unreachable" }, ...jsonError(err) },
      { status: statusOf(err), headers: { "Cache-Control": "no-store" } },
    );
  }
}
