# Malaysia Travel App - PowerShell HTTP Server
# Close this window to stop the server.

param([int]$Port = 8080)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

$Mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.json' = 'application/json'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.ico'  = 'image/x-icon'
}

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")

try {
    $Listener.Start()
} catch {
    Write-Host "ERROR: Port $Port is already in use." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "  Malaysia Travel App" -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:$Port" -ForegroundColor Green
Write-Host "  Stop: Close this window  (x button)"
Write-Host ""

# Open browser after 1 second
Start-Job { Start-Sleep 1; Start-Process "http://localhost:$using:Port" } | Out-Null

Write-Host "  Server running..." -ForegroundColor Yellow
Write-Host ""

try {
    while ($Listener.IsListening) {

        # GetContextAsync + 200ms タイムアウトで Ctrl+C に反応できるようにする
        $task = $Listener.GetContextAsync()
        while (-not $task.Wait(200)) {
            if (-not $Listener.IsListening) { break }
        }
        if (-not $Listener.IsListening) { break }
        if ($task.IsFaulted -or $task.IsCanceled) { break }

        $Context  = $task.Result
        $Request  = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath
        if ($UrlPath -eq '/') { $UrlPath = '/index.html' }

        $FilePath = Join-Path $Root $UrlPath.TrimStart('/')

        if (Test-Path $FilePath -PathType Leaf) {
            $Ext      = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $MimeType = if ($Mime.ContainsKey($Ext)) { $Mime[$Ext] } else { 'text/plain; charset=utf-8' }
            $Bytes    = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentType     = $MimeType
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $Msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $UrlPath")
            $Response.OutputStream.Write($Msg, 0, $Msg.Length)
        }

        $Response.OutputStream.Close()
    }
} finally {
    $Listener.Stop()
    Write-Host ""
    Write-Host "  Server stopped." -ForegroundColor Yellow
    Start-Sleep 1
}
