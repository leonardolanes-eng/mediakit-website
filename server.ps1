$port = if ($env:PORT) { $env:PORT } else { "8080" }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server running at http://localhost:$port/"
$mimeTypes = @{
    ".html" = "text/html"
    ".css" = "text/css"
    ".js" = "application/javascript"
    ".json" = "application/json"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".svg" = "image/svg+xml"
}
$root = $PSScriptRoot
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $root $path.TrimStart("/")
    if (Test-Path $filePath) {
        $ext = [System.IO.Path]::GetExtension($filePath)
        $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentType = $contentType
        $context.Response.ContentLength64 = $content.Length
        $context.Response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $context.Response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $context.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $context.Response.Close()
}
