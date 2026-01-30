import config from "@/config/app.config";
import { Car } from "@/types/car";
import { useEffect, useState } from "react";

export function useData(url: string) {
    const [data, setData] = useState<Car[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const SERVER_URL = config.API_URL

    async function fetchData(url: string) {
        try {
            setLoading(true)
            const res = await fetch(`${SERVER_URL}/api/data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    data: url
                }),
            });

            const data = await res.json() as Car[];
            setData(data)
        } catch (error) {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(url)
    }, [url])

    return { data, loading, error }
}