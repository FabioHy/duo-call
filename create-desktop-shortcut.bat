@echo off
setlocal
cd /d "%~dp0"

echo Creating Desktop Shortcut for Duo...
set "TARGET_DIR=%~dp0"
set "ICON_PATH=%TARGET_DIR%public\assets\icon.png"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP_DIR%\Duo.lnk'); $s.TargetPath = '%TARGET_DIR%Duo-Launcher.vbs'; $s.WorkingDirectory = '%TARGET_DIR%'; $s.Description = 'Duo - Private Call & Screen Sharing'; $s.Save()"

echo.
echo ========================================================
echo  Success! "Duo" desktop shortcut created on your Desktop!
echo ========================================================
pause
