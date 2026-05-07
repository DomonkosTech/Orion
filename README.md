# Orion — Diákmunka közvetítő platform

> # 🌐 [orion-jobs.eu](https://orion-jobs.eu/) ← kattints a megnyitáshoz!
> # 📄 [Teljes dokumentáció](./docs/Orion_documentation.pdf) ← kattints a megnyitáshoz!
> # 🗄️ [Adatbázis](./docs/adatbazis.jpeg) ← kattints a megnyitáshoz!

Az Orion egy modern diákmunka közvetítő platform, amely mesterséges intelligenciával segíti az álláskereső diákok és a munkáltatók egymásra találását.

## Gyors telepítés (Windows)

Töltsd le a legfrissebb **Orion-Setup.exe** fájlt a [kiadások oldaláról](../../releases), majd futtasd. A telepítő:

- Az Oriont a `C:\Orion` mappába másolja
- Létrehozza a Start menü és az asztal parancsikonjait

> **Figyelem:** A `start.bat` első indításkor **megpróbálja** automatikusan letölteni és telepíteni a Node.js-t és a Pythont, de ez nem mindig működik. Ha a telepítés elakad vagy hibát ír ki:
> 1. Zárd be a `start.bat` ablakot
> 2. Töltsd le és telepítsd kézzel: **[Node.js 22.x](https://nodejs.org/)** és **[Python 3.10+](https://www.python.org/)**
> 3. Indítsd újra a `start.bat` fájlt
>
> Ha többszöri próbálkozás után a Node.js vagy a Python telepítője hibázni kezd, nyisd meg a Windows **"Telepített alkalmazások"** (Installed apps) menüjét, keresd meg és távolítsd el a Node.js-t és/vagy Pythont, majd próbáld újra.

A telepítő **nem tartalmazza** az `.env` fájlt, mert az érzékeny adatokat (Supabase kulcsok, JWT titok, e-mail jelszavak) tartalmaz, amelyek kiszivárgása jelentős anyagi kárt okozhatna. Ha szükséged van az `.env` fájlra a projekt futtatásához, írj egy e-mailt az alábbi címre:

**stieber.domonkos@gmail.com**

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

