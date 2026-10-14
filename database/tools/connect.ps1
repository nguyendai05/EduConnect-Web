param(
    [switch]$LoadOnly,
    [switch]$NoPrompt,
    [string]$EnvFile = '.env.local'
)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$taskEnvPath = if ([IO.Path]::IsPathRooted($EnvFile)) { $EnvFile } else { Join-Path $taskRoot $EnvFile }
if (-not (Test-Path -LiteralPath $taskEnvPath)) {
    throw 'Chưa có .env.local. Copy .env.example thành .env.local và điền thông tin MySQL trên máy.'
}
$taskAllowedKeys = @('EDUCONNECT_DB_URL','EDUCONNECT_DB_USERNAME','EDUCONNECT_DB_PASSWORD')
$taskSettings = @{}
foreach ($taskLine in [IO.File]::ReadAllLines($taskEnvPath)) {
    if ([string]::IsNullOrWhiteSpace($taskLine) -or $taskLine.TrimStart().StartsWith('#')) { continue }
    $taskSeparator = $taskLine.IndexOf('=')
    if ($taskSeparator -lt 1) { throw 'Dòng cấu hình local không đúng dạng KEY=VALUE.' }
    $taskKey = $taskLine.Substring(0,$taskSeparator).Trim()
    if ($taskKey -notin $taskAllowedKeys) { throw 'File local chỉ nhận ba biến EDUCONNECT_DB_* đã quy định.' }
    if ($taskSettings.ContainsKey($taskKey)) { throw 'File local có key trùng; hãy giữ mỗi biến một dòng.' }
    $taskValue = $taskLine.Substring($taskSeparator+1).Trim()
    if ($taskValue.Length -ge 2 -and (
        ($taskValue.StartsWith('"') -and $taskValue.EndsWith('"')) -or
        ($taskValue.StartsWith("'") -and $taskValue.EndsWith("'")))) {
        $taskValue = $taskValue.Substring(1,$taskValue.Length-2)
    }
    # Giá trị là literal: không dot-source, không Invoke-Expression/interpolate $(), # hay =.
    $taskSettings[$taskKey] = $taskValue
}
foreach ($taskKey in $taskAllowedKeys) {
    if (-not $taskSettings.ContainsKey($taskKey)) { throw 'File local thiếu biến kết nối cần thiết.' }
}
if ([string]::IsNullOrWhiteSpace($taskSettings['EDUCONNECT_DB_USERNAME'])) { throw 'Username MySQL chưa được điền.' }
$taskUrl = $taskSettings['EDUCONNECT_DB_URL']
if (-not $taskUrl.StartsWith('jdbc:mysql://') -or $taskUrl -match '(?i)[?&](user|password|passwd)=') {
    throw 'JDBC URL phải là MySQL và không chứa username/password; dùng biến riêng.'
}
$taskPassword = $taskSettings['EDUCONNECT_DB_PASSWORD']
if ($taskPassword -eq '__ENTER_PASSWORD_LOCALLY__') {
    if ($NoPrompt) { throw 'Chưa có mật khẩu MySQL local. Điền .env.local hoặc chạy lại không có -NoPrompt để nhập kín.' }
    $taskSecret = Read-Host 'Nhập mật khẩu MySQL của user đã cấu hình (không phải mật khẩu DEMO)' -AsSecureString
    $taskPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecret)
    try { $taskPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer); $taskSecret.Dispose() }
    # Mật khẩu prompt chỉ dùng trong process, không ghi lại file.
}
$env:EDUCONNECT_DB_URL = $taskUrl
$env:EDUCONNECT_DB_USERNAME = $taskSettings['EDUCONNECT_DB_USERNAME']
$env:EDUCONNECT_DB_PASSWORD = $taskPassword
$env:SPRING_PROFILES_ACTIVE = 'db-dev'
$env:EC_DB_URL = $env:EDUCONNECT_DB_URL
$env:EC_DB_USER = $env:EDUCONNECT_DB_USERNAME
$env:EC_DB_PASSWORD = $env:EDUCONNECT_DB_PASSWORD
$taskPassword = $null
$taskSettings.Clear()
Write-Output 'Đã nạp cấu hình db-dev trong terminal hiện tại; mật khẩu không được in ra.'
if (-not $LoadOnly) {
    & (Join-Path $PSScriptRoot 'run.ps1') connection
}

