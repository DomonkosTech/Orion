# Orion installer

This project can be distributed as a Windows installer with Inno Setup.

## What the installer does

- Copies the project files into `Program Files\Orion`
- Creates Start Menu and optional desktop shortcuts
- Launches `start.bat` after installation

`start.bat` is still responsible for:

- checking whether Node.js is installed
- checking whether Python is installed
- creating `.venv`
- installing `npm` and `pip` dependencies
- starting the backend, Python service, and Vite frontend

## Build the installer

1. Install Inno Setup 6: https://jrsoftware.org/isinfo.php
2. From the project root run:

```powershell
npm run installer:build
```

3. The generated installer will be written to:

```text
installer/dist/Orion-Setup.exe
```

## GitHub upload

For a thesis submission, upload the installer as a GitHub Release asset instead of committing the `.exe` into the repository.

Recommended flow:

1. Push the source code to GitHub
2. Create a Release
3. Attach `installer/dist/Orion-Setup.exe`

## Important note about secrets

The installer currently excludes `.env` on purpose. Do not upload real API keys, JWT secrets, email passwords, or database credentials to GitHub.

If reviewers need a sample config, create a safe `.env.example` file instead.
