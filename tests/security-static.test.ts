import { describe, test, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("secrets stay server-side", () => {
  const files = walk("src").filter((f) => /\.(ts|tsx)$/.test(f));

  test("the service-role key is never referenced in application source", () => {
    const offenders = files.filter((f) => /SERVICE_ROLE/i.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  test("no NEXT_PUBLIC variable carries a secret", () => {
    const text = files.map((f) => readFileSync(f, "utf8")).join("\n");
    const publicVars = [...text.matchAll(/NEXT_PUBLIC_[A-Z_]+/g)].map((m) => m[0]);
    for (const v of new Set(publicVars)) expect(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]).toContain(v);
  });
});
