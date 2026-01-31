import config from "@/config/app.config";
import { Car } from "@/types/car";
import { useEffect, useMemo, useRef, useState } from "react";

export function useData(url: string) {
    const SERVER_URL = config.API_URL;

    const [data, setData] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true); // nur initial
    const [polling, setPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);
    const isFetching = useRef(false);
    const endpoint = useMemo(() => `${SERVER_URL}/api/data`, [SERVER_URL]);

    async function fetchData(targetUrl: string, isFirst: boolean) {
        if (isFetching.current) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            isFetching.current = true;
            if (isFirst) setLoading(true);
            else setPolling(true);

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: targetUrl }),
                signal: controller.signal,
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = (await res.json()) as Car[];
            setData(json);
            setError(null);
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            console.error(e);
            setError(e?.message ?? "Fetch failed");
        } finally {
            isFetching.current = false;
            setLoading(false);
            setPolling(false);
        }
    }

    useEffect(() => {
        let alive = true;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const loop = async (first = false) => {
            if (!alive) return;
            await fetchData(url, first);
            if (!alive) return;
            timer = setTimeout(() => loop(false), 2_000);
        };

        loop(true);

        return () => {
            alive = false;
            if (timer) clearTimeout(timer);
            abortRef.current?.abort();
        };
    }, [url, endpoint]);

    return { data, loading, polling, error };
}
