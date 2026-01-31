import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { CarCard } from "@/components/car-card";
import { useData } from "@/hooks/use-data";
import { Car } from "@/types/car";

export default function HomeScreen() {
  const { data, loading, error, polling } = useData(
    "https://www.willhaben.at/iad/gebrauchtwagen/auto/gebrauchtwagenboerse?DEALER=1&PRICE_TO=15000"
  );

  const [cars, setCars] = useState<Car[]>([]);
  const existingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    setCars((prev) => {
      const existingIds = existingIdsRef.current;

      const newCars = data.filter((c) => !existingIds.has(c.id));
      if (newCars.length === 0) return prev;

      for (const c of newCars) existingIds.add(c.id);

      const next = [...newCars, ...prev];
      console.log("cars total:", next.length);
      return next;
    });
  }, [data]);

  if (loading && cars.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Lade Autos…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Fehler</Text>
        <Text style={styles.muted}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard car={item} openUrlOnPress onPress={(c) => console.log("open", c.id)} />
        )}
        contentContainerStyle={cars.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.muted}>Keine Autos gefunden.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  listContainer: { paddingVertical: 8 },

  emptyContainer: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },

  errorTitle: { fontSize: 16, fontWeight: "700" },

  muted: { color: "rgba(0,0,0,0.6)", textAlign: "center" },

  pollingText: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    color: "rgba(0,0,0,0.45)",
    fontSize: 12,
  },
});
