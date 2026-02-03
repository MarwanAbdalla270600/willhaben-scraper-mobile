import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { CarCard } from "@/components/car-card";
import { useData } from "@/hooks/use-data";
import { Car } from "@/types/car";

const MAX_CARS = 200;

export default function HomeScreen() {
  const { isConnected, isFirst, data } = useData();
  const [cars, setCars] = useState<Car[]>([]);
  const [newCarIds, setNewCarIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data.length > 0) {
      setCars(prev => {
        if (isFirst) {
          // Erster Load: Einfach setzen
          return data.slice(0, MAX_CARS);
        }

        // Folge-Loads: Neue Autos vorne + Limit
        const existingIds = new Set(prev.map(car => car.id));
        const newCars = data.filter(car => !existingIds.has(car.id));

        if (newCars.length === 0) return prev;

        // Neue IDs für Highlight speichern
        setNewCarIds(new Set(newCars.map(car => car.id)));

        // Neue vorne + auf MAX_CARS limitieren
        const updated = [...newCars, ...prev];
        return updated.slice(0, MAX_CARS);
      });
    }
  }, [data, isFirst]);

  // Entferne Highlight nach 5s
  useEffect(() => {
    if (newCarIds.size > 0) {
      const timer = setTimeout(() => setNewCarIds(new Set()), 5000);
      return () => clearTimeout(timer);
    }
  }, [newCarIds.size]);

  if (!isConnected) {
    return (
      <View style={styles.connectionContainer}>
        <Text style={styles.connectionTitle}>❌ Keine Verbindung</Text>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      </View>
    );
  }

  const renderCarItem = ({ item }: { item: Car }) => (
    <CarCard
      car={item}
      isNew={newCarIds.has(item.id) && !isFirst}
      openUrlOnPress
      onPress={(c) => console.log("open", c.id)}
    />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {cars.length}/{MAX_CARS} Autos • {isFirst ? "Lade..." : `${newCarIds.size} neu`}
        </Text>
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCarItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.muted}>Warte auf Autos...</Text>
          </View>
        }
        ListHeaderComponent={
          newCarIds.size > 0 && !isFirst ? (
            <View style={styles.newCarsHeader}>
              <Text style={styles.newCarsText}>🆕 {newCarIds.size} neue Autos</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  statusBar: {
    padding: 10,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA"
  },

  statusText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center"
  },

  newCarsHeader: {
    backgroundColor: "#FFF9C4",
    padding: 12,
    marginBottom: 8
  },

  newCarsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
    textAlign: "center"
  },

  connectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },

  connectionTitle: {
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 12
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },

  muted: {
    color: "rgba(0,0,0,0.6)",
    marginTop: 12
  }
});