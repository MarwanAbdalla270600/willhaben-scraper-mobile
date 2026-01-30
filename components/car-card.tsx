import { Car } from "@/types/car";
import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";


type Props = {
  car: Car;
  onPress?: (car: Car) => void;
  onLongPress?: (car: Car) => void;
  /** Wenn true, öffnet der Tap automatisch car.url */
  openUrlOnPress?: boolean;
};

function formatEuro(value?: number) {
  if (value == null) return "Preis auf Anfrage";
  try {
    return new Intl.NumberFormat("de-AT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Fallback (falls Intl mal rumzickt)
    return `${Math.round(value)} €`;
  }
}

function formatKm(value?: number) {
  if (value == null) return null;
  return new Intl.NumberFormat("de-AT").format(value) + " km";
}

function joinDot(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

export const CarCard = memo(function CarCard({
  car,
  onPress,
  onLongPress,
  openUrlOnPress = false,
}: Props) {
  const price = useMemo(() => formatEuro(car.priceEur), [car.priceEur]);
  const km = useMemo(() => formatKm(car.km), [car.km]);

  const metaLine = useMemo(
    () =>
      joinDot([
        car.location ?? null,
        car.sellerType ?? null,
        car.fuel ?? null,
        car.transmission ?? null,
      ]),
    [car.location, car.sellerType, car.fuel, car.transmission]
  );

  const specLine = useMemo(
    () =>
      joinDot([
        car.year ? `EZ ${car.year}` : null,
        km,
        car.ps ? `${car.ps} PS` : null,
        car.kw ? `${car.kw} kW` : null,
      ]),
    [car.year, km, car.ps, car.kw]
  );

  const tags = useMemo(() => {
    const t: Array<{ label: string; tone?: "ok" | "neutral" }> = [];
    if (car.picker) t.push({ label: car.picker, tone: "ok" });
    // Optional: du kannst hier später weitere Tags hinzufügen
    return t;
  }, [car.picker]);

  const handlePress = async () => {
    onPress?.(car);

    if (!openUrlOnPress) return;

    if (!car.url) return;
    const can = await Linking.canOpenURL(car.url);
    if (can) await Linking.openURL(car.url);
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={() => onLongPress?.(car)}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        {/* Image */}
        <View style={styles.imageWrap}>
          {car.image ? (
            <Image
              source={{ uri: car.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>Kein Bild</Text>
            </View>
          )}

          {/* Price badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{price}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {car.title}
          </Text>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.map((t) => (
                <View
                  key={t.label}
                  style={[
                    styles.tag,
                    t.tone === "ok" ? styles.tagOk : styles.tagNeutral,
                  ]}
                >
                  <Text style={styles.tagText} numberOfLines={1}>
                    {t.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Meta */}
          {!!metaLine && (
            <Text numberOfLines={1} style={styles.meta}>
              {metaLine}
            </Text>
          )}

          {/* Specs */}
          {!!specLine && (
            <Text numberOfLines={1} style={styles.specs}>
              {specLine}
            </Text>
          )}

          {/* ID (optional klein, wie Inseratsnummer) */}
          <Text style={styles.id} numberOfLines={1}>
            ID {car.id}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.998 }],
  },
  row: {
    flexDirection: "row",
  },
  imageWrap: {
    width: 140,
    height: 110,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f2f2f2",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
  },
  priceBadge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  priceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(0,0,0,0.88)",
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    maxWidth: "100%",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagOk: {
    backgroundColor: "rgba(34,197,94,0.10)",
    borderColor: "rgba(34,197,94,0.25)",
  },
  tagNeutral: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderColor: "rgba(0,0,0,0.08)",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.78)",
  },
  meta: {
    fontSize: 12.5,
    color: "rgba(0,0,0,0.60)",
  },
  specs: {
    fontSize: 12.5,
    color: "rgba(0,0,0,0.72)",
    fontWeight: "600",
  },
  id: {
    marginTop: 2,
    fontSize: 11.5,
    color: "rgba(0,0,0,0.45)",
  },
});