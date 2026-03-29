import express from "express";
import { getSelectedJobs } from "../Controller/advertisementService.ts"

const router = express.Router();

router.post("/OrionAI", async (req, res) => {
    try {
        const { userinput, wage } = req.body;

        if (!userinput || !wage) {
            return res.status(400).json({ error: "Missing userinput or wage" });
        }
        
        const response = await fetch("http://localhost:8000/OrionAI", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userinput: userinput,
                wage: wage,
            }),
        });

        if (!response.ok) {
            throw new Error(`Python server error: ${response.statusText}`);
        }
        
        const result = await response.json();

        if (result.length === 0){
            return res.json({ success: true, data: [] });
        }
        const advertisements = await getSelectedJobs(result)
        console.log(advertisements);
        
        return res.json({ success: true, data: advertisements });

    }
    catch (err) {
        const error = err as Error;
        console.error("OrionAI route error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

export default router;
