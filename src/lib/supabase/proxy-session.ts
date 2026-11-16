import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "./cookie-options";

const GUARDED = ["/hospitals", "/pmo", "/calendar", "/todos", "/mfa"];

/** Only real app routes are guarded; unknown paths fall through to a plain 404 (no data to protect). */
export function isGuardedPath(path: string): boolean {
  return path === "/" || GUARDED.some((p) => path === p || path.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const redirect = (to: string) => {
    const r = NextResponse.redirect(new URL(to, request.url));
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  const path = request.nextUrl.pathname;
  const isLogin = path === "/login";
  if (!isLogin && !isGuardedPath(path)) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return isLogin ? response : redirect("/login");
  if (isLogin) return redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (path !== "/mfa") {
    // Owners always need TOTP; anyone who enrolled a factor must complete it (aal2).
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const mfaRequired = profile?.role === "owner" || aal?.nextLevel === "aal2";
    if (mfaRequired && aal?.currentLevel !== "aal2") return redirect("/mfa");
  }
  return response;
}
