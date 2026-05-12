param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Ticker = "AAPL",
  [switch]$SkipDbCheck
)

$ErrorActionPreference = "Stop"

function Write-Section([string]$text) {
  Write-Host ""
  Write-Host "=== $text ===" -ForegroundColor Cyan
}

function Invoke-JsonPost([string]$url, [hashtable]$body) {
  $json = $body | ConvertTo-Json -Depth 6
  return Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body $json
}

Write-Section "RAG smoke test starting"
Write-Host "Base URL: $BaseUrl"
Write-Host "Ticker: $Ticker"

if (-not $SkipDbCheck) {
  Write-Section "Checking DB prerequisites"
  Push-Location "d:\FYP"
  try {
    $dbProbe = @'
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const table = await prisma.$queryRawUnsafe("SELECT to_regclass('public.document_embeddings') AS name");
  const fn = await prisma.$queryRawUnsafe("SELECT to_regprocedure('match_documents(vector, double precision, integer, character varying)') AS name");

  const tableOk = !!(table && table[0] && table[0].name);
  const fnOk = !!(fn && fn[0] && fn[0].name);

  console.log(JSON.stringify({ tableOk, fnOk, table: table?.[0]?.name || null, fn: fn?.[0]?.name || null }));
  await prisma.$disconnect();

  if (!tableOk || !fnOk) {
    process.exit(2);
  }
}

main().catch(async (e) => {
  console.error(String(e));
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
'@

    $tmpProbePath = Join-Path (Get-Location) ".rag-db-probe.cjs"
    Set-Content -Path $tmpProbePath -Value $dbProbe -Encoding UTF8
    $dbOut = node $tmpProbePath 2>&1 | Out-String
    Remove-Item $tmpProbePath -ErrorAction SilentlyContinue
    Write-Host $dbOut
    if ($LASTEXITCODE -ne 0) {
      Write-Host "RAG DB prerequisites missing. Run server/prisma/sql/init-rag.sql first." -ForegroundColor Yellow
      exit 1
    }
  } finally {
    Pop-Location
  }
}

Write-Section "Checking API reachability"
try {
  $ping = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$BaseUrl/api/rag/ingest/status/$Ticker" -TimeoutSec 10
  Write-Host "API reachable: HTTP $($ping.StatusCode)"
} catch {
  Write-Host "API not reachable at $BaseUrl. Start app first with npm run dev." -ForegroundColor Yellow
  Write-Host $_.Exception.Message
  exit 1
}

Write-Section "Ingesting ticker context"
$ingestResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/rag/ingest/$Ticker"
$ingestResponse | ConvertTo-Json -Depth 8

Write-Section "Reading ingestion status"
$statusResponse = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/rag/ingest/status/$Ticker"
$statusResponse | ConvertTo-Json -Depth 8

Write-Section "Running SEC semantic search checks"
$queries = @(
  "What risk factors are mentioned in Apple's latest 10-K?",
  "Summarize management discussion and analysis for Apple from SEC filings",
  "What recent SEC filing sections discuss Apple business risks and outlook?"
)

foreach ($q in $queries) {
  Write-Host ""
  Write-Host "Query: $q" -ForegroundColor Green

  $searchBody = @{
    query = $q
    matchCount = 5
    ticker = $Ticker
    sourceTypes = @("sec_filing")
    dateFrom = (Get-Date).AddYears(-2).ToString("o")
    dateTo = (Get-Date).ToString("o")
  }

  $searchResponse = Invoke-JsonPost "$BaseUrl/api/rag/search" $searchBody

  if (-not $searchResponse.results -or $searchResponse.results.Count -eq 0) {
    Write-Host "No results returned." -ForegroundColor Yellow
    continue
  }

  $top = $searchResponse.results | Select-Object -First 3
  foreach ($r in $top) {
    $section = if ($r.metadata -and $r.metadata.section) { $r.metadata.section } else { "n/a" }
    $formType = if ($r.metadata -and $r.metadata.form_type) { $r.metadata.form_type } else { "n/a" }
    $score = if ($r.rerankScore) { [double]$r.rerankScore } else { [double]$r.similarity }

    Write-Host "- score=$([Math]::Round($score,4)) type=$($r.sourceType) form=$formType section=$section"
    if ($r.snippet) {
      $snippet = [string]$r.snippet
      if ($snippet.Length -gt 200) { $snippet = $snippet.Substring(0, 200) + "..." }
      Write-Host "  snippet: $snippet"
    }
  }
}

Write-Section "Smoke test complete"
Write-Host "If sec_filing results are returned with section/form metadata, semantic retrieval is working."
