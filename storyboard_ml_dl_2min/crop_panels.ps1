Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $root 'storyboard_reference.png'
$panelsDir = Join-Path $root 'panels'
$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
$xEdges = @(0, 421, 841, 1255, $src.Width)
$rows = @(@(45, 225), @(349, 213), @(650, 202))
$index = 1
foreach ($row in $rows) {
    $y = [int]$row[0]
    $height = [int]$row[1]
    for ($col = 0; $col -lt 4; $col++) {
        $width = [int]($xEdges[$col + 1] - $xEdges[$col])
        $rect = [System.Drawing.Rectangle]::new([int]$xEdges[$col], $y, $width, $height)
        $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $target = Join-Path $panelsDir ('panel_{0:D2}.png' -f $index)
        $crop.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
        $crop.Dispose()
        $index++
    }
}
$src.Dispose()

$thumbW = 414
$thumbH = 220
$sheet = [System.Drawing.Bitmap]::new($thumbW * 4, $thumbH * 3)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(15, 18, 24))
for ($i = 1; $i -le 12; $i++) {
    $im = [System.Drawing.Bitmap]::FromFile((Join-Path $panelsDir ('panel_{0:D2}.png' -f $i)))
    $scale = [Math]::Min($thumbW / $im.Width, $thumbH / $im.Height)
    $w = [int][Math]::Round($im.Width * $scale)
    $h = [int][Math]::Round($im.Height * $scale)
    $x = (($i - 1) % 4) * $thumbW + [int](($thumbW - $w) / 2)
    $y = [Math]::Floor(($i - 1) / 4) * $thumbH + [int](($thumbH - $h) / 2)
    $g.DrawImage($im, [System.Drawing.Rectangle]::new($x, $y, $w, $h))
    $im.Dispose()
}
$sheet.Save((Join-Path $root 'panel_contact.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$sheet.Dispose()
Write-Output 'Updated 12 panel crops and contact sheet.'
