$process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -NoNewWindow -PassThru -WorkingDirectory $PSScriptRoot

Start-Sleep -Seconds 2

# Envoyer 'N' pour répondre à la question des analytics
$process.StandardInput.WriteLine("N")
$process.StandardInput.Flush()

# Garder le processus actif
$process.WaitForExit()
