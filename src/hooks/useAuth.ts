import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../Api/authApi.ts';

/**
 * Custom hook to manage authentication state and user details.
 * Handles checking auth status, setting user type, and generating initials.
 **/
export function useAuth() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userType, setUserType] = useState<"user" | "company" | null>(null);
    const [loading, setLoading] = useState(true);
    const [initials, setInitials] = useState<string>("");
    const [name, setName] = useState<string>(""); //bocsi peti
    // /\
    // ||
    // majd te megoldod csáááá
    // kellet holnapra név a UserHomePage re
    // max majd kitörlöd

    useEffect(() => {
        // Track mounted state to avoid memory leaks
        let mounted = true;

        const check = async () => {
            try {
                // Fetch current auth status from backend
                const data = await checkAuthStatus();
                if (!mounted) return;

                setLoggedIn(Boolean(data.loggedIn));
                setUserType(data.userType || null);


                if (data.loggedIn) {
                    // Generate initials based on user type (User vs Company)
                    if (data.userType === 'user' && data.fname && data.lname) {
                        setName(`${data.fname}`)
                        setInitials(`${data.lname.charAt(0)}${data.fname.charAt(0)}`.toUpperCase());
                    } else if (data.userType === 'company' && data.companyName) {
                        setInitials(data.companyName.substring(0, 2).toUpperCase());
                    } else {
                        // Fallback if name data is missing
                        setInitials(data.userType === 'user' ? 'U' : 'C');
                    }
                } else {
                    setInitials("");
                }

            } catch {
                // Reset state on error
                if (!mounted) return;
                setLoggedIn(false);
                setUserType(null);
                setInitials("");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Perform initial auth check
        check();

        // Listen for global auth changes to trigger re-check
        const handler = () => {
            check();
        };
        window.addEventListener("auth-changed", handler);

        // Cleanup event listener and mounted flag
        return () => {
            mounted = false;
            window.removeEventListener("auth-changed", handler);
        };
    }, []);

    return { loggedIn, userType, loading, initials, name };
}
