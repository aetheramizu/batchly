import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles links from Supabase auth emails (sign-up confirmation, password reset).
// Supports both the PKCE `code` flow and `token_hash` email templates.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  const supabase = await createClient();
  let failed = true;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
    if (error) console.error("[batchly] auth confirm (code):", error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = Boolean(error);
    if (error) console.error("[batchly] auth confirm (otp):", error);
  }

  const destination = request.nextUrl.clone();
  destination.search = "";
  if (failed) {
    destination.pathname = "/login";
    destination.searchParams.set("error", "link");
  } else {
    destination.pathname = next;
  }
  return NextResponse.redirect(destination);
}
