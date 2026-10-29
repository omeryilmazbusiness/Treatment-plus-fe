import { NextResponse, type NextRequest } from "next/server";

import { getRuntime } from "@/bootstrap";
import { resolveActiveSession } from "@/platform/auth/session";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const runtime = getRuntime();
    const session = await resolveActiveSession(runtime.config, runtime.backend);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const backendUrl = runtime.config.api.url;
    const response = await fetch(`${backendUrl}/v1/plans/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return new NextResponse(errText || "PDF not ready", {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="tedavi-plani-${id}.pdf"`,
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
