@echo off
SETLOCAL EnableDelayedExpansion

echo [0/4] Node.js ellenorzese...
where npm >nul 2>nul
if errorlevel 1 (
    echo Az 'npm' nem talalhato. Megprobalom telepiteni a Node.js-t...
    where winget >nul 2>nul
    if errorlevel 1 (
        echo HIBA: A 'winget' nem talalhato. Kerlek telepitsd a Node.js-t manualisan: https://nodejs.org/
        pause
        exit /b 1
    )
    echo Node.js telepitese folyamatban...
    winget install -e --id OpenJS.NodeJS.LTS
    if errorlevel 1 (
        echo HIBA: A telepites sikertelen volt.
        pause
        exit /b 1
    )
    echo A Node.js sikeresen telepitve. Kerlek INDITSD UJRA ezt a bat fajlt az uj PATH beallitasokhoz!
    pause
    exit /b 0
)

echo [1/4] Node.js fuggosegek ellenorzese...
if not exist node_modules (
    echo A node_modules nem letezik, telepites inditasa...
    call npm install
) else (
    echo A node_modules mar letezik.
)

echo.
echo [2/4] Python virtualis kornyezet ellenorzese...
where python >nul 2>nul
if errorlevel 1 (
    echo A 'python' nem talalhato. Megprobalom telepiteni...
    where winget >nul 2>nul
    if errorlevel 1 (
        echo HIBA: A 'winget' nem talalhato. Kerlek telepitsd a Python-t manualisan!
        pause
        exit /b 1
    )
    echo Python telepitese folyamatban...
    winget install -e --id Python.Python.3.12
    if errorlevel 1 (
        echo HIBA: A telepites sikertelen volt.
        pause
        exit /b 1
    )
    echo A Python sikeresen telepitve. Kerlek INDITSD UJRA ezt a bat fajlt az uj PATH beallitasokhoz!
    pause
    exit /b 0
)
if not exist .venv (
    echo A .venv nem letezik, Letrehozas...
    python -m venv .venv
    if errorlevel 1 (
        echo HIBA: A Python nincs telepitve vagy nem elerheto a PATH-ban!
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
start "Node Server" cmd /k "npm run server"

:: Start OrionAI Python Server
start "OrionAI" cmd /k "npm run OrionAI"

:: Start Vite Dev Server
start "Vite Dev" cmd /k "npm run dev"

echo.
echo Minden szerver elindult kulon ablakban.
echo Bezárhatod ezt az ablakot.
pause
