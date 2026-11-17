import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { needsMfa, parseRole } from "@/domain/roles";
import { SESSION_COOKIE_OPTIONS } from "./cookie-options";

const GUARDED = ["/hospitals", "/pmo", "/calendar", "/todos", "/account", "/team", "/mfa"];

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

  // Identity from the JWT, verified locally: no round trip to the Auth server on every click.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) return isLogin ? response : redirect("/login");
  if (isLogin) return redirect("/");

  // A session already at aal2 (TOTP done) needs nothing else. Only aal1 sessions pay for the role lookup,
  // which decides whether MFA is still required: admins and editors always, anyone else who enrolled a factor.
  if (path !== "/mfa" && claims.aal !== "aal2") {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", claims.sub).single();
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (needsMfa(parseRole(profile?.role)) || aal?.nextLevel === "aal2") return redirect("/mfa");
  }
  return response;
}
