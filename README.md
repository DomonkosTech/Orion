# Orion — MI-alapú álláskeresési és toborzási platform

[![Weboldal](https://img.shields.io/badge/weboldal-orion--jobs.eu-4B8BBE)](https://orion-jobs.eu/)
[![Dokumentáció](https://img.shields.io/badge/dokumentáció-60_oldal_(PDF,_/docs_mappában)-informational)](./docs/Orion_documentation.pdf)

Az Orion mesterséges intelligenciával támogatott állásközvetítéssel és beépített jelentkezőkövető rendszerrel (ATS) köti össze az álláskeresőket és a cégeket.

## Gyors telepítés (Windows)

Töltsd le a legfrissebb **Orion-Setup.exe** fájlt a [kiadások oldaláról](../../releases), majd futtasd. A telepítő:

- Az Oriont a `%LOCALAPPDATA%\Programs\Orion` mappába másolja
- Létrehozza a Start menü és az asztal parancsikonjait
- Első indításkor automatikusan telepíti a Node.js-t, a Pythont és az összes projektfüggőséget

A telepítés után be kell állítanod a saját `.env` fájlodat (lásd: [Környezeti változók](#környezeti-változók)).

> A telepítő az [Inno Setup](https://jrsoftware.org/isinfo.php) segítségével készül. Az újbóli összeállításhoz futtasd a `.\installer\Build-Installer.ps1` parancsot.

## Kézi telepítés (fejlesztőknek)

### Előfeltételek

- **Node.js** 22.x (a projekt npm 10.x-et használ)
- **Python** 3.10+ (az OrionAI ajánlómotorhoz)
- Egy **Supabase** projekt (adatbázisként és valósidejű backendként szolgál)

### Telepítés

```bash
# 1. Klónozás és függőségek telepítése
git clone <repo-url> && cd Orion
npm install

# 2. Python virtuális környezet létrehozása az AI szolgáltatáshoz
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux
pip install -r requirements.txt

# 3. Környezeti változók beállítása
cp .env.example .env
# Töltsd ki a Supabase URL-t, kulcsokat és JWT titkot az .env fájlban

# 4. A frontend és a backend indítása
npm run dev        # Vite fejlesztői szerver a :5173-as porton
npm run server     # Express API a :4000-es porton
```

### Környezeti változók

Másold a `.env.example` fájlt `.env` néven, és tölts ki minden mezőt. Szükséges változók:

| Változó | Leírás |
|---|---|
| `ENCRYPTION_KEY` | AES titkosítási kulcs az érzékeny adatokhoz |
| `JWT_SECRET` | Titok a JWT tokenek aláírásához |
| `EMAIL` | E-mail cím a rendszerértesítésekhez |
| `EMAIL_PASSWORD` | Alkalmazás-jelszó az e-mail fiókhoz |
| `SUPABASE_SERVICE_KEY` | Supabase service role kulcs |
| `SUPABASE_URL` | A Supabase projekted URL-je |

## Alapvető használat

```tsx
// src/main.tsx — a belépési pont
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Az alkalmazás három nyelvet (angol, német, magyar) és három szerepkört támogat:
- **Vendég** — böngészheti a nyitóoldalt, regisztrálhat vagy bejelentkezhet
- **Felhasználó** — állásokat kereshet és pályázhat rájuk, kezelheti jelentkezéseit, önéletrajzot tölthet fel
- **Cég** — álláshirdetéseket tehet közzé, kezelheti a hirdetéseket, követheti a jelentkezőket az ATS-en keresztül

## Hibaelhárítás

**"Encryption key loaded: undefined"** — Az `.env` fájl hiányzik vagy hiányos. Másold a `.env.example` fájlt és tölts ki minden mezőt.

**CORS hibák a frontenden** — Győződj meg róla, hogy az `npm run server` fut a 4000-es porton.

**Python script not found** — Futtasd közvetlenül az `npm run OrionAI` parancsot, hogy ellenőrizd, a `.venv` megfelelően van-e beállítva.

