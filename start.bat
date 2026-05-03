@echo off
SETLOCAL EnableDelayedExpansion

if not defined ORION_RELAUNCH_COUNT set ORION_RELAUNCH_COUNT=0

if not exist .env if exist .env.example (
    echo .env nem talalhato, masolas a .env.example sablonbol...
    copy .env.example .env >nul
    echo FIGYELEM: A .env fajl a .env.example sablonbol lett letrehozva.
    echo Allitsd be a valodi ertekeket a .env fajlban a projekt inditasa elott!
    echo.
)

echo [0/4] Node.js ellenorzese...
where npm >nul 2>nul
if errorlevel 1 (
    echo Az 'npm' nem talalhato. Megprobalom telepiteni a Node.js-t...
    call :install_nodejs
    if errorlevel 1 exit /b 1
    call :refresh_path
    call :ensure_node_path
    where npm >nul 2>nul
    if errorlevel 1 (
        call :auto_restart "Node.js telepitese utan"
        exit /b !errorlevel!
    )
)

echo [1/4] Node.js fuggosegek ellenorzese...
if not exist node_modules\.bin\tsx.cmd (
    echo A Node.js fejlesztoi fuggosegek hianyoznak, telepites inditasa...
    call npm install
    if errorlevel 1 (
        echo HIBA: Az npm install sikertelen volt.
        pause
        exit /b 1
    )
)
if not exist node_modules\.bin\vite.cmd (
    echo A Vite nincs telepitve, javito telepites inditasa...
    call npm install
    if errorlevel 1 (
        echo HIBA: Az npm install sikertelen volt.
        pause
        exit /b 1
    )
)
if not exist node_modules\.bin\tsx.cmd (
    echo HIBA: A tsx tovabbra sem erheto el az npm install utan.
    pause
    exit /b 1
)
if not exist node_modules\.bin\vite.cmd (
    echo HIBA: A vite tovabbra sem erheto el az npm install utan.
    pause
    exit /b 1
) else (
    echo A szukseges Node.js eszkozok elerhetok.
)

echo.
echo [2/4] Python virtualis kornyezet ellenorzese...
where python >nul 2>nul
if errorlevel 1 (
    echo A 'python' nem talalhato. Megprobalom telepiteni...
    call :install_python
    if errorlevel 1 exit /b 1
    call :refresh_path
    call :ensure_python_path
    where python >nul 2>nul
    if errorlevel 1 (
        call :auto_restart "Python telepitese utan"
        exit /b !errorlevel!
    )
)
if not exist .venv\Scripts\python.exe (
    echo A .venv nem letezik vagy serult, Letrehozas...
    if exist .venv rmdir /s /q .venv
    python -m venv .venv
    if errorlevel 1 (
        echo HIBA: A Python virtualis kornyezet letrehozasa sikertelen!
        pause
        exit /b 1
    )
)

echo.
echo [3/4] Python fuggosegek frissitese...
call .venv\Scripts\activate
python -m pip install --upgrade pip
if exist requirements.txt (
    pip install -r requirements.txt
) else (
    echo FIGYELEM: requirements.txt nem talalhato!
)

echo.
echo [4/4] Szerverek inditasa...

:: Start API Server
start "Node Server" /D "%~dp0" cmd /k "npm run server || (echo. & echo HIBA: A Node Server leallt. Nyomj le egy billentyut a bezarashoz. & pause >nul)"

:: Start OrionAI Python Server
start "OrionAI" /D "%~dp0" cmd /k "npm run OrionAI || (echo. & echo HIBA: Az OrionAI folyamat leallt. Nyomj le egy billentyut a bezarashoz. & pause >nul)"

:: Start Vite Dev Server
start "Vite Dev" /D "%~dp0" cmd /k "npm run dev || (echo. & echo HIBA: A Vite szerver leallt. Nyomj le egy billentyut a bezarashoz. & pause >nul)"

echo.
echo Minden szerver elindult kulon ablakban.
echo Bezárhatod ezt az ablakot.
pause
exit /b 0

:install_nodejs
where winget >nul 2>nul
if not errorlevel 1 (
    echo Node.js telepitese winget-tel...
    winget install -e --id OpenJS.NodeJS.LTS
    if not errorlevel 1 exit /b 0
    echo winget telepites sikertelen, masik modszer probalasa...
)
where choco >nul 2>nul
if not errorlevel 1 (
    echo Node.js telepitese Chocolatey-vel...
    choco install nodejs-lts -y
    if not errorlevel 1 exit /b 0
    echo Chocolatey telepites sikertelen, masik modszer probalasa...
)
echo Node.js telepitese kozvetlen letoltessel (PowerShell)...
powershell -ExecutionPolicy Bypass -Command "$url='https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi'; $out=\"$env:TEMP\nodejs-installer.msi\"; Write-Host 'Letoltes...'; Invoke-WebRequest -Uri $url -OutFile $out; Write-Host 'Telepites...'; $p = Start-Process msiexec.exe -Args \"/i `\"$out`\" /quiet /norestart\" -Wait -PassThru; Remove-Item $out; exit $p.ExitCode"
if errorlevel 1 (
    echo HIBA: Minden automatikus telepitesi modszer sikertelen volt.
    echo Kerlek telepitsd a Node.js-t manualisan: https://nodejs.org/
    pause
    exit /b 1
)
exit /b 0

:install_python
where winget >nul 2>nul
if not errorlevel 1 (
    echo Python telepitese winget-tel...
    winget install -e --id Python.Python.3.12
    if not errorlevel 1 exit /b 0
    echo winget telepites sikertelen, masik modszer probalasa...
)
where choco >nul 2>nul
if not errorlevel 1 (
    echo Python telepitese Chocolatey-vel...
    choco install python312 -y
    if not errorlevel 1 exit /b 0
    echo Chocolatey telepites sikertelen, masik modszer probalasa...
)
echo Python telepitese kozvetlen letoltessel (PowerShell)...
powershell -ExecutionPolicy Bypass -Command "$url='https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe'; $out=\"$env:TEMP\python-installer.exe\"; Write-Host 'Letoltes...'; Invoke-WebRequest -Uri $url -OutFile $out; Write-Host 'Telepites...'; $p = Start-Process $out -Args '/quiet InstallAllUsers=1 PrependPath=1' -Wait -PassThru; Remove-Item $out; exit $p.ExitCode"
if errorlevel 1 (
    echo HIBA: Minden automatikus telepitesi modszer sikertelen volt.
    echo Kerlek telepitsd a Python-t manualisan: https://www.python.org/downloads/
    pause
    exit /b 1
)
exit /b 0

:refresh_path
for /f "tokens=2,*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul ^| find /i "Path"') do set "SYS_PATH=%%B"
for /f "tokens=2,*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul ^| find /i "Path"') do set "USER_PATH=%%B"
if defined SYS_PATH set "PATH=%SYS_PATH%"
if defined USER_PATH set "PATH=%PATH%;%USER_PATH%"
goto :eof

:ensure_node_path
if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
goto :eof

:ensure_python_path
if exist "%LocalAppData%\Programs\Python\Python312\python.exe" set "PATH=%LocalAppData%\Programs\Python\Python312;%LocalAppData%\Programs\Python\Python312\Scripts;%PATH%"
if exist "%ProgramFiles%\Python312\python.exe" set "PATH=%ProgramFiles%\Python312;%ProgramFiles%\Python312\Scripts;%PATH%"
if exist "%ProgramFiles(x86)%\Python312\python.exe" set "PATH=%ProgramFiles(x86)%\Python312;%ProgramFiles(x86)%\Python312\Scripts;%PATH%"
goto :eof

:auto_restart
set /a NEXT_RELAUNCH=ORION_RELAUNCH_COUNT+1
if %NEXT_RELAUNCH% GTR 3 (
    echo HIBA: A script tobbszori ujrainditas utan sem talalta a szukseges eszkozoket.
    echo Probald meg kezileg ujrainditani ezt a fajlt.
    pause
    exit /b 1
)
echo %~1 a script automatikusan ujraindul 5 masodperc mulva...
start "" cmd /c "timeout /t 5 /nobreak >nul && set ORION_RELAUNCH_COUNT=%NEXT_RELAUNCH% && call \"%~f0\""
exit /b 0
