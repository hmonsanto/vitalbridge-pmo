# Writes .env.local from the running local Supabase stack (no manual copy/paste).
# Usage (from the project root): powershell -ExecutionPolicy Bypass -File scripts/setup-env.ps1
$lines = npx supabase status -o env 2>$null
$map = @{}
foreach ($l in $lines) {
  if ($l -match '^(\w+)="(.*)"$') { $map[$Matches[1]] = $Matches[2] }
}
foreach ($k in 'API_URL', 'ANON_KEY', 'SERVICE_ROLE_KEY') {
  if (-not $map[$k]) { throw "Missing $k. Is local Supabase running? (npx supabase start)" }
}
@(
  "NEXT_PUBLIC_SUPABASE_URL=$($map['API_URL'])",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($map['ANON_KEY'])",
  "SUPABASE_SERVICE_ROLE_KEY=$($map['SERVICE_ROLE_KEY'])"
) | Set-Content -Encoding ascii .env.local
Write-Host ".env.local written."
