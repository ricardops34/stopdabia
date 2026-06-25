$env:NEXT_PUBLIC_SUPABASE_URL = "https://oaqmpgtlgdysuxsrpzvq.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcW1wZ3RsZ2R5c3V4c3JwenZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTk3MDMsImV4cCI6MjA5NzUzNTcwM30.NooqINUv-GZfjdw30Q0plTgXcPxAXpcmuy3TwaJ1N04"
$env:NEXT_PUBLIC_BASE_URL = "https://adedonha.bjsoft.com.br"

docker buildx build `
  --platform linux/amd64 `
  --provenance=false `
  --build-arg NEXT_PUBLIC_SUPABASE_URL `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY `
  --build-arg NEXT_PUBLIC_BASE_URL `
  -t bjsoftware/stop-adedonha:latest `
  --push `
  .
