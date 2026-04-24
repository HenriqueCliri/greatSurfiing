import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { fetchBeachConditions } from "./src/services/api";
import { BeachResponse } from "./src/types/beach";

const DEFAULT_COORDS = {
  lat: 34.0195,
  lon: -118.4912,
};

function statusColor(status: BeachResponse["status"]): string {
  if (status === "GOOD") {
    return "#16a34a";
  }

  if (status === "MEDIUM") {
    return "#ca8a04";
  }

  return "#dc2626";
}

export default function App(): JSX.Element {
  const [data, setData] = useState<BeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Obtendo localização...");

  const loadBeachData = useCallback(async (lat: number, lon: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchBeachConditions(lat, lon);
      setData(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Erro inesperado";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationText("Localização negada. Usando localização padrão.");
        await loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const lat = Number(location.coords.latitude.toFixed(4));
      const lon = Number(location.coords.longitude.toFixed(4));
      setLocationText(`Lat ${lat}, Lon ${lon}`);
      await loadBeachData(lat, lon);
    };

    load().catch(() => {
      setLocationText("Não foi possível obter localização. Usando localização padrão.");
      loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon).catch(() => {
        // Errors are already handled in loadBeachData.
      });
    });
  }, [loadBeachData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Beach Conditions</Text>
        <Text style={styles.location}>{locationText}</Text>

        <TouchableOpacity style={styles.refreshButton} onPress={() => loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon)}>
          <Text style={styles.refreshText}>Atualizar</Text>
        </TouchableOpacity>

        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>Erro: {error}</Text> : null}

        {data ? (
          <View style={styles.metricsContainer}>
            <Text style={styles.metric}>Temperatura: <Text style={styles.metricValue}>{data.temp.toFixed(1)} °C</Text></Text>
            <Text style={styles.metric}>Vento: <Text style={styles.metricValue}>{data.wind.toFixed(1)} m/s</Text></Text>
            <Text style={styles.metric}>Altura da onda: <Text style={styles.metricValue}>{data.wave_height.toFixed(2)} m</Text></Text>

            <Text style={[styles.status, { color: statusColor(data.status) }]}>{data.status}</Text>
            <Text style={styles.bestTime}>Melhor período: {data.best_time}</Text>
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
    backgroundColor: "#eaf4ff",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  location: {
    marginTop: 8,
    textAlign: "center",
    color: "#475569",
  },
  refreshButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "700",
  },
  metricsContainer: {
    marginTop: 20,
    gap: 8,
  },
  metric: {
    fontSize: 18,
    color: "#0f172a",
  },
  metricValue: {
    fontWeight: "700",
  },
  status: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 40,
    fontWeight: "900",
  },
  bestTime: {
    marginTop: 8,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
  },
  summary: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 16,
    color: "#334155",
  },
  error: {
    marginTop: 12,
    color: "#b91c1c",
    textAlign: "center",
    fontWeight: "700",
  },
});
