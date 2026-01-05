import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../services/authService';

export function useAuth() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userType, setUserType] = useState<"user" | "company" | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const check = async () => {
            try {
                const data = await checkAuthStatus();
                if (!mounted) return;
                setLoggedIn(Boolean(data.loggedIn));
                setUserType(data.userType || null);
            } catch {
                if (!mounted) return;
                setLoggedIn(false);
                setUserType(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Initial check
        check();

        // Listen for global auth changes
        const handler = () => {
            check();
        };
        window.addEventListener("auth-changed", handler);

        return () => {
            mounted = false;
            window.removeEventListener("auth-changed", handler);
        };
    }, []);

    return { loggedIn, userType, loading };
}
