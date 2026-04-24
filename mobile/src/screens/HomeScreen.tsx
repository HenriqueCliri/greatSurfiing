import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { fetchBeachConditions } from "../services/api";
import { BeachResponse } from "../types/beach";

interface HomeScreenProps {
  lat: number;
  lon: number;
}

export default function HomeScreen({ lat, lon }: HomeScreenProps): JSX.Element {
  const [data, setData] = useState<BeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBeachData = useCallback(async (): Promise<void> => {
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
  }, [lat, lon]);

  useEffect(() => {
    loadBeachData().catch(() => {
      // errors are already handled in loadBeachData
    });
  }, [loadBeachData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Beach Conditions</Text>

        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        {data ? (
          <View style={styles.metricsContainer}>
            <Text style={styles.metric}>Temperature: <Text style={styles.metricValue}>{data.temp.toFixed(1)} °C</Text></Text>
            <Text style={styles.metric}>Wind: <Text style={styles.metricValue}>{data.wind.toFixed(1)} m/s</Text></Text>
            <Text style={styles.metric}>Wave height: <Text style={styles.metricValue}>{data.wave_height.toFixed(2)} m</Text></Text>

            <Text style={styles.status}>{data.status}</Text>
            <Text style={styles.bestTime}>Best time: {data.best_time}</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
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
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 16,
  },
  metricsContainer: {
    width: "100%",
    marginTop: 16,
    gap: 10,
  },
  metric: {
    fontSize: 20,
    textAlign: "center",
  },
  metricValue: {
    fontWeight: "700",
  },
  status: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 48,
    fontWeight: "900",
  },
  bestTime: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  summary: {
    textAlign: "center",
    fontSize: 18,
    color: "#334155",
  },
  error: {
    color: "#b91c1c",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
