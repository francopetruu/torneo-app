# Generate TypeScript types from Supabase schema
# Usage: .\scripts\generate-types.ps1 [local|remote]

param(
    [string]$Mode = "local"
)

if ($Mode -eq "local") {
    Write-Host "Generating types from local Supabase instance..."
    supabase gen types typescript --local | Out-File -FilePath "apps/client/src/types/database.types.ts" -Encoding utf8
    Copy-Item "apps/client/src/types/database.types.ts" "apps/admin/src/types/database.types.ts"
    Write-Host "Types generated successfully!"
}
elseif ($Mode -eq "remote") {
    Write-Host "Generating types from remote Supabase project..."
    Write-Host "Make sure you're linked: supabase link --project-ref <project-ref>"
    supabase gen types typescript --linked | Out-File -FilePath "apps/client/src/types/database.types.ts" -Encoding utf8
    Copy-Item "apps/client/src/types/database.types.ts" "apps/admin/src/types/database.types.ts"
    Write-Host "Types generated successfully!"
}
else {
    Write-Host "Usage: .\scripts\generate-types.ps1 [local|remote]"
    exit 1
}





