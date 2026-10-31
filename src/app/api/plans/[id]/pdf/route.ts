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
    let response = await fetch(`${backendUrl}/v1/plans/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    // If PDF has not been generated yet or plan needs snapshot, ensure ready and generate it
    if (!response.ok) {
      // 1. Mark plan ready (creates the snapshot if plan was in draft)
      await fetch(`${backendUrl}/v1/plans/${id}/ready`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      // 2. Generate the PDF
      const genRes = await fetch(`${backendUrl}/v1/plans/${id}/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (genRes.ok) {
        response = await fetch(`${backendUrl}/v1/plans/${id}/pdf`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
      }
    }

    if (!response.ok) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Tedavi Planı PDF</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
    .card { background: white; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #e2e8f0; max-width: 440px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    h2 { margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    p { margin: 0 0 1.5rem; font-size: 0.875rem; color: #64748b; line-height: 1.5; }
    .btn { background: #0f172a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <h2>PDF Henüz Hazır Değil</h2>
    <p>Bu tedavi planı için henüz kurumsal teklif PDF'i derlenmedi. Lütfen stüdyo ekranındaki <strong>"Yenile"</strong> butonuna tıklayarak teklifi oluşturunuz.</p>
    <button class="btn" onclick="window.close()">Pencereyi Kapat</button>
  </div>
</body>
</html>`,
        {
          status: response.status,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="tedavi-plani-${id}.pdf"`,
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
