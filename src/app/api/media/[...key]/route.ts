import { NextResponse, type NextRequest } from "next/server";

import { getRuntime } from "@/bootstrap";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    if (!key || key.length === 0) {
      return new NextResponse("Key required", { status: 400 });
    }

    const objectKey = key.join("/");
    const runtime = getRuntime();
    const backendUrl = runtime.config.api.url;

    const response = await fetch(`${backendUrl}/v1/media/${objectKey}`, {
      method: "GET",
    });

    if (!response.ok) {
      return new NextResponse("Media not found", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}

