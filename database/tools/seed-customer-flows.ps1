param([switch]$Apply)

# Tác giả: Trường Đạt. Nạp dữ liệu mẫu khách hàng bằng dependency của JAR hiện tại.
# Phạm vi DAT-01/02/03/04; không tạo giỏ, đơn, hợp đồng hoặc thanh toán.
# Không chạy migration, không xóa dữ liệu, không ghi đè bộ mẫu đã được thao tác.
$ErrorActionPreference = 'Stop'
$customerRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
[xml]$customerPom = Get-Content -LiteralPath (Join-Path $customerRoot 'pom.xml')
$customerJar = Join-Path $customerRoot ("target/{0}-{1}.jar" -f $customerPom.project.artifactId, $customerPom.project.version)
if (-not (Test-Path -LiteralPath $customerJar)) {
    throw 'Cần chạy Maven package trước để dùng đúng class và dependency của dự án.'
}
$customerRuntime = Join-Path $customerRoot 'target/customer-flow-seed'
$customerClasses = Join-Path $customerRuntime 'classes'
$customerLibs = Join-Path $customerRuntime 'lib'
New-Item -ItemType Directory -Force $customerClasses, $customerLibs | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$customerArchive = [IO.Compression.ZipFile]::OpenRead($customerJar)
try {
    foreach ($customerEntry in $customerArchive.Entries) {
        if ($customerEntry.FullName.StartsWith('BOOT-INF/lib/') -and $customerEntry.Name.EndsWith('.jar')) {
            $customerOutput = Join-Path $customerLibs $customerEntry.Name
        } elseif ($customerEntry.FullName.StartsWith('BOOT-INF/classes/') -and $customerEntry.Name) {
            $customerOutput = Join-Path $customerClasses $customerEntry.FullName.Substring('BOOT-INF/classes/'.Length)
        } else {
            continue
        }
        $customerResolved = [IO.Path]::GetFullPath($customerOutput)
        if (-not $customerResolved.StartsWith([IO.Path]::GetFullPath($customerRuntime) + [IO.Path]::DirectorySeparatorChar)) {
            throw 'JAR chứa đường dẫn ngoài thư mục runtime được chỉ định.'
        }
        New-Item -ItemType Directory -Force ([IO.Path]::GetDirectoryName($customerResolved)) | Out-Null
        [IO.Compression.ZipFileExtensions]::ExtractToFile($customerEntry, $customerResolved, $true)
    }
} finally {
    $customerArchive.Dispose()
}
$customerClasspath = $customerClasses + [IO.Path]::PathSeparator + (Join-Path $customerLibs '*')
$customerMode = if ($Apply) { '--apply' } else { '--inspect' }
$customerSocketTemp = Join-Path $customerRoot '../.codex-tmp'
New-Item -ItemType Directory -Force $customerSocketTemp | Out-Null
Push-Location -LiteralPath $customerRoot
try {
    & java '-Djava.net.preferIPv4Stack=true' '-Dstdout.encoding=UTF-8' '-Dstderr.encoding=UTF-8' "-Djdk.net.unixdomain.tmpdir=$customerSocketTemp" `
        --class-path $customerClasspath database/tools/CustomerFlowSeed.java $customerMode
    if ($LASTEXITCODE -ne 0) { throw "Nạp/kiểm dữ liệu khách hàng thất bại, exit=$LASTEXITCODE." }
} finally {
    Pop-Location
}
