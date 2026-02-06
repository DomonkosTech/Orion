import { supabase } from "../lib/supabaseClient";

async function seed() {
    console.log("Starting student job seed...");

    const { data: companies, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .limit(1);

    if (companyError || !companies || companies.length === 0) {
        console.error("Hiba: Cég nem található.");
        process.exit(1);
    }

    const companyId = companies[0].id;

    // AI slop
    //    |
    //    |
    //    V

    // --- STUDENT & INTERN DATA POOL ---
    const positions = [
        // --- IT & ENGINEERING INTERNS (University) ---
        "Junior Java Fejlesztő Gyakornok", "React Frontend Gyakornok", "Node.js Backend Trainee",
        "Python Data Science Gyakornok", "Manuális Tesztelő (Diákmunka)", "Automata Tesztelő Gyakornok",
        "Rendszergazda Gyakornok", "IT Helpdesk Support (Diák)", "Mobilapp Fejlesztő Gyakornok",
        "DevOps Junior (Részmunkaidő)", "PHP Fejlesztő Gyakornok", "C++ Szoftverfejlesztő Gyakornok",
        "Mérnök Gyakornok (Villamos)", "Gépészmérnök Gyakornok", "CAD Tervező Gyakornok",

        // --- OFFICE & ADMIN (University/High School) ---
        "Irodai Adminisztrátor", "Adatrögzítő Diákmunka", "HR Asszisztens Gyakornok",
        "Marketing Gyakornok", "Social Media Asszisztens", "Pénzügyi Gyakornok",
        "Könyvelő Asszisztens", "Logisztikai Adminisztrátor", "Ügyfélszolgálatos (Call Center)",
        "Recepciós (Diákmunka)", "Fordító / Tolmács Diák", "Jogi Gyakornok",

        // --- RETAIL & HOSPITALITY (General Student Jobs) ---
        "Árufeltöltő", "Kasszás / Pénztáros", "Bolti Kisegítő", "Ruházati Eladó Diák",
        "Gyorséttermi Munkatárs", "Pincér / Felszolgáló Diák", "Pultos", "Barista Segéd",
        "Konyhai Kisegítő", "Mosogató", "Futár (Biciklis/Robogós)", "Mozis Diákmunka",
        "Hostess (Rendezvény)", "Szobalány / Takarító", "Fagylaltárus",

        // --- MANUAL & OTHER ---
        "Raktári Kisegítő", "Csomagoló (Webshop)", "Komissiózó (Raktár)",
        "Könnyű Fizikai Munka", "Sor melletti összeszerelő", "Leltározó",
        "Kertészeti Segédmunka", "Promóter / Szórólapos", "Animátor (Gyerektábor)",
        "Magántanár (Korrepetálás)", "Úszómester / Vízimentő"
    ];

    const taskFragments = [
        "napi adminisztrációs feladatok precíz ellátása",
        "felettesek munkájának támogatása napi szinten",
        "vásárlók és ügyfelek udvarias kiszolgálása",
        "adatbázisok frissítése és karbantartása",
        "munkakörnyezet tisztán és rendben tartása",
        "könnyű fizikai feladatok ellátása",
        "részvétel szakmai projektek előkészítésében",
        "dokumentációk kezelése és rendszerezése",
        "beérkező telefonhívások és e-mailek kezelése",
        "árukészlet feltöltése és polcok rendezése",
        "egyszerűbb szoftveres tesztelési feladatok",
        "rendelések összekészítése és csomagolása",
        "csapatmunkában való aktív részvétel",
        "szükség esetén helyettesítési feladatok ellátása",
        "promóciós anyagok kiosztása és tájékoztatás"
    ];

    const requirementFragments = [
        "aktív vagy passzív nappali tagozatos hallgatói jogviszony",
        "betöltött 16. életév (bizonyos esetekben 18)",
        "legalább heti 20 óra munkavégzés vállalása",
        "felhasználói szintű számítógépes ismeretek (Word, Excel)",
        "pontos, megbízható és önálló munkavégzés",
        "jó kommunikációs és kapcsolatteremtő készség",
        "monotóniatűrés és precizitás",
        "középfokú angol nyelvtudás előnyt jelent",
        "csapatszellem és nyitott személyiség",
        "hosszú távú munkalehetőség keresése",
        "hasonló területen szerzett tapasztalat előny",
        "érvényes tüdőszűrő lelet (segítünk az ügyintézésben)"
    ];

    const locations = [
        "Budapest", "Budapest, XI. kerület", "Budapest, XIII. kerület", "Debrecen",
        "Szeged", "Pécs", "Győr", "Miskolc", "Veszprém", "Nyíregyháza",
        "Sopron", "Eger", "Gödöllő", "Home Office", "Hibrid (Budapest)"
    ];

    const descriptionTemplates = [
        "Suli mellett keresel munkát? Csatlakozz hozzánk {position} pozícióba! Rugalmas beosztás vár.",
        "Szakmai gyakorlati helyet keresel? {position} lehetőség nálunk, ahol valós tudást szerezhetsz.",
        "Zsebpénzre van szükséged? {location} környékén keresünk diákokat {position} feladatokra.",
        "Karrierépítés már az egyetem alatt! Jelentkezz {position} munkakörbe és alapozd meg a jövődet.",
        "Könnyű diákmunka, versenyképes órabér! {position} pozícióba várunk lelkes jelentkezőket."
    ];

    //================|
    // end of AI slop |
    //================|


    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const generateText = (arr: string[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).join(". ") + ".";
    };

    const jobs = [];
    const TOTAL_JOBS = 1;

    for (let i = 0; i < TOTAL_JOBS; i++) {
        const pos = pick(positions);
        const loc = pick(locations);

        // Logic for Student Wages (Hourly instead of Monthly)
        // Tech jobs: 2500 - 4500 HUF / hour
        // Standard jobs: 1600 - 2500 HUF / hour
        const isTech = pos.includes("Fejlesztő") || pos.includes("Mérnök") || pos.includes("Gyakornok") || pos.includes("Tester") || pos.includes("IT");

        const minWage = isTech ? 2200 : 1600;
        const maxWage = isTech ? 4500 : 2500;

        // Generates a random wage rounded to the nearest 10 (e.g., 1850)
        const wage = Math.floor((minWage + Math.random() * (maxWage - minWage)) / 10) * 10;

        jobs.push({
            title: pos,
            position: pos,
            location: loc,
            hourly_wage: wage,
            tasks: generateText(taskFragments, 4),
            requirements: generateText(requirementFragments, 4),
            job_description: pick(descriptionTemplates).replace("{position}", pos).replace("{location}", loc),
            is_active: true,
            company_id: companyId,
            created_at: new Date().toISOString()
        });
    }

    // Insert
    const batchSize = 1;
    for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        const { error } = await supabase.from("advertisement").insert(batch);
        if (error) console.error("Batch error:", error);
        else console.log(`Beszúrva: ${i + batch.length} / ${TOTAL_JOBS}`);
    }

    console.log("Kész! 500 diákmunka hirdetés hozzáadva.");
    process.exit(0);
}

seed();