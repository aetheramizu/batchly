import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static assets, and PWA files (the manifest and
    // service worker must stay reachable without a session; apple-icon is a
    // generated image route without a file extension).
    "/((?!_next/static|_next/image|favicon.ico|apple-icon|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
