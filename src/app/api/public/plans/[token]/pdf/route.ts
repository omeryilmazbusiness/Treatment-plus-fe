import { NextResponse, type NextRequest } from "next/server";

import { getRuntime } from "@/bootstrap";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    if (!token) {
      return new NextResponse("Token required", { status: 400 });
    }

    const runtime = getRuntime();
    const backendUrl = runtime.config.api.url;

    const response = await fetch(`${backendUrl}/v1/public/plans/${token}/pdf`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errText = await response.text();
      return new NextResponse(errText || "PDF not available", {
        status: response.status,
      });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tedavi-plani.pdf"`,
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}

