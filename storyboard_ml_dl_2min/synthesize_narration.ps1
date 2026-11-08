$ErrorActionPreference = 'Stop'
$root = 'D:\New folder\storyboard_ml_dl_2min'
$audioDir = Join-Path $root 'audio'
New-Item -ItemType Directory -Path $audioDir -Force | Out-Null

$segments = @(
    @{ Narration = "Hey, I'm Nova. In the next two minutes, we'll compare machine learning with deep learning and see what each is good at."; Caption = "Hey, I'm Nova. In the next two minutes,`nwe'll compare machine learning with deep learning and see what each is good at." },
    @{ Narration = 'AI is the broad goal. Machine learning is one way computers learn patterns from examples instead of following every hand-written rule.'; Caption = 'AI is the broad goal. Machine learning is one way computers learn patterns from examples`ninstead of following every hand-written rule.' },
    @{ Narration = 'Give a model many labeled cat and dog photos. It learns patterns from those examples, then uses them to classify new pictures.'; Caption = 'Give a model many labeled cat and dog photos. It learns patterns from those examples,`nthen uses them to classify new pictures.' },
    @{ Narration = 'In traditional machine learning, people choose features such as ear shape, fur color, body outline, and size before training.'; Caption = 'In traditional machine learning, people choose features such as ear shape,`nfur color, body outline, and size before training.' },
    @{ Narration = 'Deep learning is a type of machine learning. Layered neural networks learn useful features directly from raw data, including images and sound.'; Caption = 'Deep learning is a type of machine learning. Layered neural networks learn useful features`ndirectly from raw data, including images and sound.' },
    @{ Narration = 'Early layers detect edges and shapes. Later layers combine them into patterns like whiskers, eyes, faces, and objects.'; Caption = 'Early layers detect edges and shapes. Later layers combine them into patterns`nlike whiskers, eyes, faces, and objects.' },
    @{ Narration = 'This helps analyze images, speech, and video, powering tools for medical scans, face recognition, and driver assistance.'; Caption = 'This helps analyze images, speech, and video, powering tools for medical scans,`nface recognition, and driver assistance.' },
    @{ Narration = 'Deep learning often needs more data and computing power. Traditional machine learning can be faster and easier to inspect.'; Caption = 'Deep learning often needs more data and computing power. Traditional machine learning`ncan be faster and easier to inspect.' },
    @{ Narration = 'For a small dataset and clear features, start with a machine-learning baseline. It might already solve the problem well.'; Caption = 'For a small dataset and clear features, start with a machine-learning baseline.`nIt might already solve the problem well.' },
    @{ Narration = 'For complicated patterns and plenty of examples, deep learning may perform better. It still needs careful training and fair testing.'; Caption = 'For complicated patterns and plenty of examples, deep learning may perform better.`nIt still needs careful training and fair testing.' },
    @{ Narration = 'Compare both on data the model has never seen. Check accuracy, reliability, cost, and the mistakes each approach makes.'; Caption = 'Compare both on data the model has never seen. Check accuracy, reliability, cost,`nand the mistakes each approach makes.' },
    @{ Narration = 'Deep learning is part of machine learning. Both learn from data. Choose the simplest method that reliably solves your task.'; Caption = 'Deep learning is part of machine learning. Both learn from data.`nChoose the simplest method that reliably solves your task.' }
)

[System.IO.File]::WriteAllText((Join-Path $root 'narration_script.txt'), (($segments | ForEach-Object { $_.Narration }) -join "`r`n`r`n"), [System.Text.UTF8Encoding]::new($false))
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Zira Desktop')
$synth.Rate = 0
$records = @()
for ($i = 0; $i -lt $segments.Count; $i++) {
    $id = '{0:D2}' -f ($i + 1)
    $wav = Join-Path $audioDir ("shot_$id.wav")
    $synth.SetOutputToWaveFile($wav)
    $synth.Speak($segments[$i].Narration)
    $synth.SetOutputToNull()
    $duration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $wav)
    $records += [PSCustomObject]@{ Id = $id; StartSeconds = ($i * 10.0); DurationSeconds = $duration; Narration = $segments[$i].Narration; Caption = $segments[$i].Caption }
    Write-Output ("shot {0}: {1:N2}s" -f $id, $duration)
}
$synth.Dispose()
$records | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $root 'narration_timing.json') -Encoding utf8
if (($records | Measure-Object -Property DurationSeconds -Maximum).Maximum -ge 9.8) { throw 'At least one narration segment is too long for its 10-second slot.' }
