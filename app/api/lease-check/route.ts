import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf, analyseLeaseText } from "@/lib/leaseCheck";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { document_url: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body.document_url) {
    return NextResponse.json({ error: "document_url required" }, { status: 400 });
  }

  // Create a pending record immediately so the client can poll
  const { data: check, error: insertError } = await (supabase as any)
    .from("lease_checks")
    .insert({ user_id: user.id, document_url: body.document_url, status: "processing" })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Kick off extraction + analysis in the background (best-effort in serverless)
  processLeaseCheck(check.id, body.document_url, supabase).catch(async () => {
    await (supabase as any)
      .from("lease_checks")
      .update({ status: "failed" })
      .eq("id", check.id);
  });

  return NextResponse.json({ id: check.id, status: "processing" }, { status: 202 });
}

async function processLeaseCheck(
  checkId:     string,
  documentUrl: string,
  supabase:    Awaited<ReturnType<typeof createClient>>,
) {
  // Fetch the document
  const res = await fetch(documentUrl);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "";
  const buffer = Buffer.from(await res.arrayBuffer());

  let text: string;
  if (contentType.includes("pdf") || documentUrl.toLowerCase().endsWith(".pdf")) {
    text = await extractTextFromPdf(buffer);
  } else {
    // Treat as plain text (photos require an OCR integration added later)
    text = buffer.toString("utf-8");
  }

  const flags = await analyseLeaseText(text);

  // Persist extracted text and mark completed
  await (supabase as any)
    .from("lease_checks")
    .update({ extracted_text: text, status: "completed", completed_at: new Date().toISOString() })
    .eq("id", checkId);

  if (flags.length > 0) {
    await (supabase as any)
      .from("lease_check_flags")
      .insert(flags.map((f) => ({ ...f, lease_check_id: checkId })));
  }
}
