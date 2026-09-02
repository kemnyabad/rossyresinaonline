$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $PSScriptRoot "..\\backups"
$target = Join-Path $backupRoot $timestamp

New-Item -ItemType Directory -Force -Path $target | Out-Null

$sources = @(
  "..\\src\\data\\products.json",
  "..\\src\\data\\orders.json",
  "..\\src\\data\\users.json",
  "..\\prisma\\schema.prisma"
)

foreach ($source in $sources) {
  $resolved = Join-Path $PSScriptRoot $source
  if (Test-Path $resolved) {
    Copy-Item -Path $resolved -Destination $target -Force
  }
}

$meta = @"
{
  "createdAt": "$(Get-Date -Format o)",
  "type": "weekly",
  "source": "rossyresinaonline"
}
"@

$metaPath = Join-Path $target "backup-meta.json"
Set-Content -Path $metaPath -Value $meta -Encoding UTF8

Write-Output "Backup generado en: $target"
