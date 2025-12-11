import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./CompanyLoginPage.module.css";

// Import your new components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/buttons/button";

const CompanyLoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:4000/api/company/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, rememberMe }),
            });

            interface LoginResponse {
                success: boolean;
                error?: string;
            }

            const contentType = res.headers.get("content-type") || "";
            let data: LoginResponse | null = null;

            if (contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                // Give a clearer error when server returns HTML (e.g., proxy or 404)
                throw new Error(
                    `A szerver nem JSON választ adott: ${text.substring(0, 180)}...`
                );
            }

            if (!res.ok) {
                toast.error(data?.error || `Szerver hiba (${res.status})`);
                return;
            }

            if (data?.success) {
                toast.success("Sikeres bejelentkezés!");

                // Confirm that the session cookie is active before navigating
                try {
                    // Retry a few times in case the Set-Cookie propagation is slightly delayed
                    let confirmed = false;
                    for (let i = 0; i < 5; i++) {
                        const checkRes = await fetch("http://localhost:4000/auth/check", {
                            method: "GET",
                            credentials: "include",
                            cache: "no-store",
                        });
                        const checkData = await checkRes.json();
                        if (checkData?.loggedIn && checkData?.userType === "company") {
                            confirmed = true;
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 100));
                    }
                    if (!confirmed) {
                        // Even if not confirmed, proceed — the guard will handle it soon after
                        console.warn("Login session not confirmed immediately; proceeding to navigate.");
                    }
                } catch (e) {
                    console.warn("Auth check after login failed", e);
                }

                // Inform guards to re-evaluate authentication
                try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
                navigate("/company");
            } else {
                toast.error(data?.error || "Hibás bejelentkezési adatok");
            }
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Hálózati hiba történt";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Toaster />
            <form onSubmit={handleLogin} className={styles.form}>
                <h1>Cég bejelentkezés</h1>

                <div className={styles.fieldsContainer}>
                    <InputField
                        id="email"
                        label="Email cím"
                        type="email"
                        placeholder="email@pelda.hu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <InputField
                        id="password"
                        label="Jelszó"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.optionsRow}>
                    <Checkbox
                        label="Emlékezz rám"
                        checked={rememberMe}
                        onChange={setRememberMe}
                    />

                    <Button
                        type="button"
                        variant="link"
                        onClick={() => toast("Elfelejtett jelszó funkció hamarosan!")}
                    >
                        Elfelejtette jelszavát?
                    </Button>
                </div>

                {/* Button Group */}
                <div className={styles.actions}>
                    <Button type="submit" isLoading={isLoading} variant="primary">
                        Bejelentkezés
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/CompanyRegisterPage")}
                    >
                        Regisztráció
                    </Button>
                </div>

                <div className={styles.footer}>
                    <p>
                        Nincs még fiókja?{" "}
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate("/CompanyRegisterPage")}
                        >
                            Regisztráljon itt
                        </Button>
                    </p>

                    <div className={styles.divider} />

                    <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate("/UserLoginPage")}
                    >
                        Váltás felhasználó nézetre
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CompanyLoginPage;