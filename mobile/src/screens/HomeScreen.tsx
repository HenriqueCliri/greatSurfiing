import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { fetchBeachConditions } from "../services/api";
import { BeachResponse } from "../types/beach";

const DEFAULT_COORDS = {
  lat: 34.0195,
  lon: -118.4912,
};

function getStatusColor(status: BeachResponse["status"]): string {
  if (status === "GOOD") {
    return "#16a34a";
  }

  if (status === "MEDIUM") {
    return "#ca8a04";
  }

  return "#dc2626";
}

export default function HomeScreen(): JSX.Element {
  const [data, setData] = useState<BeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Obtaining location...");

  const loadBeachData = useCallback(async (lat: number, lon: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchBeachConditions(lat, lon);
      setData(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unexpected error";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWithUserLocation = useCallback(async (): Promise<void> => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      setLocationText("Location permission denied. Using default coordinates.");
      await loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    const lat = Number(position.coords.latitude.toFixed(4));
    const lon = Number(position.coords.longitude.toFixed(4));

    setLocationText(`Lat ${lat}, Lon ${lon}`);
    await loadBeachData(lat, lon);
  }, [loadBeachData]);

  useEffect(() => {
    let isMounted = true;

    const start = async (): Promise<void> => {
      try {
        await loadWithUserLocation();
      } catch {
        if (!isMounted) {
          return;
        }

        setLocationText("Location unavailable. Using default coordinates.");
        await loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      }
    };

    start().catch(() => {
      // Errors are handled in start.
    });

    return () => {
      isMounted = false;
    };
  }, [loadBeachData, loadWithUserLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Beach Conditions</Text>
        <Text style={styles.location}>{locationText}</Text>

        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        {data ? (
          <>
            <Text style={[styles.status, { color: getStatusColor(data.status) }]}>{data.status}</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>🌡</Text>
                <Text style={styles.metricLabel}>Temperature</Text>
                <Text style={styles.metricValue}>{data.temp.toFixed(1)} °C</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>🌬</Text>
                <Text style={styles.metricLabel}>Wind</Text>
                <Text style={styles.metricValue}>{data.wind.toFixed(1)} m/s</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>🌊</Text>
                <Text style={styles.metricLabel}>Wave Height</Text>
                <Text style={styles.metricValue}>{data.wave_height.toFixed(2)} m</Text>
              </View>
            </View>

            <Text style={styles.bestTime}>Best time: {data.best_time}</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    textAlign: "center",
  },
  status: {
    marginTop: 4,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 56,
    fontWeight: "900",
  },
  metricsGrid: {
    width: "100%",
    gap: 10,
  },
  metricCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#475569",
  },
  metricValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  bestTime: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  summary: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 17,
    color: "#334155",
  },
  error: {
    color: "#b91c1c",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
