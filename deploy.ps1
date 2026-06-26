$env:NEXT_PUBLIC_SUPABASE_URL = "https://oaqmpgtlgdysuxsrpzvq.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcW1wZ3RsZ2R5c3V4c3JwenZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTk3MDMsImV4cCI6MjA5NzUzNTcwM30.NooqINUv-GZfjdw30Q0plTgXcPxAXpcmuy3TwaJ1N04"
$env:NEXT_PUBLIC_BASE_URL = "https://adedonha.bjsoft.com.br"

$maxTentativas = 3
for ($i = 1; $i -le $maxTentativas; $i++) {
  Write-Host "==> Build + Push linux/amd64 (tentativa $i/$maxTentativas)..." -ForegroundColor Cyan
  docker buildx build `
    --platform linux/amd64 `
    --provenance=false `
    --build-arg NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL `
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY `
    --build-arg NEXT_PUBLIC_BASE_URL=$env:NEXT_PUBLIC_BASE_URL `
    -t bjsoftware/stop-adedonha:latest `
    --push `
    .
  if ($LASTEXITCODE -eq 0) {
    Write-Host "==> Deploy concluido!" -ForegroundColor Green
    exit 0
  }
  if ($i -lt $maxTentativas) {
    Write-Host "Falhou, aguardando 10s para nova tentativa..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
  }
}

Write-Host "Deploy falhou apos $maxTentativas tentativas!" -ForegroundColor Red
exit 1
