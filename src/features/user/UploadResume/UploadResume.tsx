import { useState } from "react";

const UploadResume = () => {
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [url, setUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            alert("Csak PDF fájlt lehet feltölteni!");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert("A fájl mérete nem lehet nagyobb 5MB-nál!");
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file) {
            alert("Válassz ki egy PDF fájlt először!");
            return;
        }

        setSending(true);
        setUrl(null);

        try {
            const formData = new FormData();
            formData.append("resume", file); // Multer ezt várja

            const response = await fetch("http://localhost:4000/api/upload-resume", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Feltöltési hiba");
            }

            const data = await response.json();

            alert("PDF sikeresen feltöltve!");
            setUrl(data.url);
            setFile(null);

        } catch (err: unknown) {
            if (err instanceof Error) {
                alert("Hiba: " + err.message);
            } else {
                alert("Ismeretlen hiba történt");
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <h1>Upload Resume</h1>

            <ul>
                <li>Csak PDF fájlt lehet feltölteni.</li>
                <li>Maximum 5MB lehet a fájl mérete.</li>
            </ul>

            <input type="file" accept=".pdf" onChange={handleFileChange} />

            {file && <p>Kiválasztott fájl: {file.name}</p>}

            <button onClick={handleSubmit} disabled={sending || !file}>
                {sending ? "Elküldés..." : "Elküld"}
            </button>

            {url && (
                <div>
                    <p>Ideiglenes letöltési link:</p>
                    <a href={url} target="_blank" rel="noreferrer">
                        {url}
                    </a>
                </div>
            )}
        </div>
    );
};

export default UploadResume;
