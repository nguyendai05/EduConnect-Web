param(
    [ValidateSet('hash','connection','migrate','validate','compare-schema','baseline-reviewed','passwords','lock-check','sql','verify','constraints','seed')]
    [string]$Command = 'verify',
    [string]$SqlFile
)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
[xml]$taskPom = Get-Content -LiteralPath (Join-Path $taskRoot 'pom.xml')
$taskArtifact = [string]$taskPom.project.artifactId
$taskVersion = [string]$taskPom.project.version
$taskLibs = Join-Path $taskRoot "target/$taskArtifact-$taskVersion/WEB-INF/lib"
if (-not (Test-Path -LiteralPath $taskLibs)) {
    throw 'Chạy Maven package trước để dùng đúng dependency project; công cụ không tự cài thư viện.'
}
$taskClassPath = ((Get-ChildItem -LiteralPath $taskLibs -Filter '*.jar').FullName -join [IO.Path]::PathSeparator)
$taskSqlDefaults = @{ verify='database/03_verify.sql'; constraints='database/04_constraint_checks.sql'; seed='database/02_seed_dev.sql' }
if ($taskSqlDefaults.ContainsKey($Command)) { $SqlFile=$taskSqlDefaults[$Command]; $Command='sql' }
if ($Command -eq 'sql' -and [string]::IsNullOrWhiteSpace($SqlFile)) { throw 'Lệnh sql cần đường dẫn file.' }
Push-Location -LiteralPath $taskRoot
try {
    $taskArgs = @('--class-path',$taskClassPath,'database/tools/DatabaseTool.java',$Command)
    if ($Command -eq 'sql') { $taskArgs += $SqlFile }
    & java @taskArgs
    if ($LASTEXITCODE -ne 0) { throw "Kiểm DB thất bại, exit=$LASTEXITCODE; không bỏ qua lỗi SQL." }
} finally { Pop-Location }
