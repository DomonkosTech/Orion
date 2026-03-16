# Orion Frontend Részletes Dokumentáció

## 1. Bevezetés és Jövőkép
Az Orion nem csupán egy állásportál, hanem egy komplex ökoszisztéma, amely a modern munkakeresést és toborzást hivatott egyszerűsíteni. A frontend fejlesztése során az elsődleges szempont a **sebesség**, a **biztonság** és a **vizuális kiválóság** volt. Ez a dokumentáció a fejlesztők és érdekelt felek számára nyújt mély betekintést a rendszer működésébe.

---

## 2. Technológiai Mélyfúrás

### Frontend Alapok
- **React 19 & Vite**: Az alkalmazás a React legújabb stabil verzióját használja, ami lehetővé teszi a komponensek hatékonyabb renderelését. A Vite biztosítja, hogy a fejlesztési ciklus (Hot Module Replacement) és a végső build folyamat is optimális legyen.
- **TypeScript (Strict Mode)**: A projekt szigorú típusellenőrzéssel készül, ami garantálja, hogy az adatstruktúrák (pl. `Applicant`, `Job`, `Message`) konzisztensek maradjanak az egész alkalmazásban.

### Állapotkezelés és Adatfolyam
- **Context API vs Hooks**: A komplexebb funkciók (mint a Messenger) saját `Provider`-t használnak (`MessengerProvider`), amely központosítja az üzenetek és a kiválasztott beszélgetések állapotát. Az egyszerűbb logikák egyedi hook-okba (`useMessenger`, `useAuth`) vannak szervezve.
- **Supabase Real-time**: Bár az alapvető adatlekérés REST alapú, a rendszer felépítése lehetővé teszi a real-time frissítést a Supabase előfizetésein keresztül.

---

## 3. Moduláris Felépítés és Feature-ök

### 3.1. Az Applicant Tracking System (ATS) Részletesen
Az ATS a vállalatok számára készült modul, amely a jelöltek kezelését automatizálja.
- **Vizuális Élménypanelek**: A jelöltek kártyái a `framer-motion` segítségével animáltak, biztosítva a sima átmenetet a lista és a részletes nézet között (`layoutId` használatával).
- **Státuszkezelés**: A munkaadók egyetlen kattintással fogadhatják el vagy utasíthatják el a jelentkezőket, ami azonnali visszajelzést küld a Supabase adatbázisba.
- **Görgetési Indikátorok**: A nagy tartalmú profiloknál dinamikus görgetési segédletek (`scrollIndicator`) segítik a navigációt.

### 3.2. Orion Messenger (Belső Üzenetküldő)
A rendszer saját üzenetküldő platformmal rendelkezik:
- **Kétpaneles Elrendezés**: Bal oldalon a beszélgetések listája, jobb oldalon az aktív csevegés látható.
- **Responsive Adaptáció**: Mobil nézetben a rendszer intelligensen vált a lista és a chat ablak között a felhasználói fókusz megtartása érdekében.
- **Környezet-alapú Paraméterezés**: A Messenger képes URL paraméterek alapján (`?userId=...`) azonnal megnyitni egy specifikus beszélgetést, például az ATS-ből átirányítva.

### 3.3. Álláskeresői Dashboard
- **Intelligens Szűrés**: A felhasználók kategória, helyszín és bérezés alapján szűrhetik a hirdetéseket.
- **Kedvencek Rendszere**: A jelöltek "szívecskézhetik" az állásokat, amelyeket a rendszer a profiljukhoz kötve tartósan tárol.

---

## 4. Design Rendszer: A "Premium Orion" Esztétika

Az alkalmazás vizuális kódja az alábbi elvekre épül:

### Glassmorphism Technika
Minden fontosabb kártya és modális ablak az alábbi CSS tulajdonságokkal rendelkezik:
- `backdrop-filter: blur(10px)`: Az üvegszerű hatás eléréséhez.
- `background: rgba(255, 255, 255, 0.7)`: A finom áttetszőségért.
- `border: 1px solid rgba(255, 255, 255, 0.2)`: A rétegek elkülönítéséhez.

### Animációs Stratégia
A `framer-motion` könyvtárat használjuk a "mikro-interakciókhoz":
- **Gombok**: Hover állapotban enyhe nagyítás és fényhatás.
- **Oldalváltások**: Lágy áttűnések (fade-in) biztosítják a folyamatosság érzetét.
- **Részecske Háttér**: A `tsparticles` integráció egy dinamikus, de diszkrét mozgást ad a háttérnek, ami növeli a "high-tech" érzetet.

---

## 5. Fejlesztési és Karbantartási Útmutató

### Új Feature Hozzáadása
1. Hozzon létre egy új mappát a `src/features` alatt.
2. Definiálja a szükséges típusokat a `src/Api` megfelelő fájljában.
3. Használjon CSS modulokat a stílusok elkülönítéséhez.
4. Regisztrálja az új útvonalat az `App.tsx` fájlban, szükség esetén az `IsLoggedIn` guard használatával.

### Teljesítmény Optimalizálás
- **Asset Kezelés**: Minden ikont a `lucide-react`-ból importálunk, ami támogatja a tree-shaking-et (csak a használt ikonok kerülnek a végleges fájlba).
- **Lusta Betöltés (Code Splitting)**: A nagyobb modulok (pl. Messenger, ATS) dinamikusan is betölthetőek lennének a betöltési idő további csökkentése érdekében.

---

## 6. Összegzés
Az Orion frontendje a modern webfejlesztés csúcsát képviseli a technológiai választások és a felhasználói élmény terén. A moduláris felépítés biztosítja, hogy a rendszer hosszú távon fenntartható és könnyen bővíthető maradjon.

---
*Dokumentáció verzió: 2.0*  
*Frissítve: 2026-03-16*
