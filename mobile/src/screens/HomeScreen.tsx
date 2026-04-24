import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MetricCard from "../components/MetricCard";
import StatusText from "../components/StatusText";
import { useBeachConditions } from "../hooks/useBeachConditions";

export default function HomeScreen(): JSX.Element {
  const { data, loading, error, locationText } = useBeachConditions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Beach Conditions</Text>
        <Text style={styles.location}>{locationText}</Text>

        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        {data ? (
          <>
            <StatusText status={data.status} />

            <View style={styles.metricsGrid}>
              <MetricCard icon="🌡" label="Temperature" value={`${data.temp.toFixed(1)} °C`} />
              <MetricCard icon="🌬" label="Wind" value={`${data.wind.toFixed(1)} m/s`} />
              <MetricCard icon="🌊" label="Wave Height" value={`${data.wave_height.toFixed(2)} m`} />
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
  metricsGrid: {
    width: "100%",
    gap: 10,
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
