import config from "@/config/app.config";
import { Car } from "@/types/car";
import { playNewCarsSound } from "@/utils/sound";
import { useEffect, useRef, useState } from "react";

export function useData() {
    const WS_URL = config.WS_URL;
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [data, setData] = useState<Car[]>([]);
    const [isFirst, setIsFirst] = useState<boolean>(true);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        console.log("🔌 Verbinde WebSocket...");
        const ws = new WebSocket(`${WS_URL}/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("✅ WebSocket verbunden");
            setIsConnected(true);
        };

        ws.onmessage = (e) => {
            try {
                const newCars: Car[] = JSON.parse(e.data);

                if (Array.isArray(newCars)) {
                    playNewCarsSound()
                    console.log(`📥 ${newCars.length} Autos empfangen`);

                    setData(newCars);

                    // Nur beim ersten nicht-leeren Array
                    if (isFirst && newCars.length > 0) {
                        console.log("🎯 Erste Daten geladen");
                        setIsFirst(false);
                    }
                }
            } catch (error) {
                console.error("❌ Parse Fehler:", error);
            }
        };

        ws.onerror = (e) => {
            console.error("❌ WebSocket Fehler:", e);
            setIsConnected(false);
        };

        ws.onclose = (e) => {
            console.log("🔌 Verbindung geschlossen:", e.code);
            setIsConnected(false);
            setIsFirst(true); // 🔥 Bei Reconnect wieder auf first setzen
        };

        return () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [WS_URL]); // Nur WS_URL als Dependency

    return { isConnected, isFirst, data };
}