import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../../../services/userServise";

const UploadResume = () => {
    // State for the selected file, sending status, and navigation
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    // Handles file selection and validation
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type (only PDF allowed)
        if (selectedFile.type !== "application/pdf") {
            alert("Csak PDF fájlt lehet feltölteni!");
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            alert("A fájl mérete nem lehet nagyobb 5MB-nál!");
            return;
        }

        setFile(selectedFile);
    };

    // Handles the file upload submission
    const handleSubmit = async () => {
        if (!file) {
            alert("Válassz ki egy PDF fájlt először!");
            return;
        }

        setSending(true);

        try {
            // Use the uploadResume service to handle the upload
            await uploadResume(file);

            alert("PDF sikeresen feltöltve!");
            // Navigate to the home page on successful upload
            navigate("/");

        } catch (err: unknown) {
            // Handle and display errors from the service or network
            if (err instanceof Error) {
                alert("Hiba: " + err.message);
            } else {
                alert("Ismeretlen hiba történt");
            }
        } finally {
            // Stop the sending indicator
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
        </div>
    );
};

export default UploadResume;
