import config from "@/config/app.config";
import { Car } from "@/types/car";
import { useEffect, useRef, useState } from "react";

export function useData(url: string) {
    const [data, setData] = useState<Car[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const SERVER_URL = config.API_URL;

    // verhindert parallele Requests
    const isFetching = useRef(false);

    async function fetchData(targetUrl: string) {
        if (isFetching.current) return;

        try {
            isFetching.current = true;
            setLoading(true);

            const res = await fetch(`${SERVER_URL}/api/data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: targetUrl }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = (await res.json()) as Car[];
            setData(json);
            setError(false);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        // sofort einmal laden
        fetchData(url);

        // dann alle 10 Sekunden
        const interval = setInterval(() => {
            fetchData(url);
        }, 10_000);

        // Cleanup (SEHR wichtig!)
        return () => clearInterval(interval);
    }, [url, SERVER_URL]);

    return { data, loading, error };
}
