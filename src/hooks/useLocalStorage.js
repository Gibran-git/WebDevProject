import { useEffect, useState } from "react";

//AI-assisted - see AI-USAGE.md #11
export function useLocalStorage(key, initialValue, onLoad) {
    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            const parsed = stored !== null ? (JSON.parse(stored) ?? initialValue) : initialValue;
            return onLoad ? onLoad(parsed) : parsed;
        } catch {
            return onLoad ? onLoad(initialValue) : initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Ignore storage maximum or storage blocked errors
        }
    }, [key, value]);

    return [value, setValue];
}