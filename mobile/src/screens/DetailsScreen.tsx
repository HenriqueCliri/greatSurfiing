import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import InfoCard from "../components/InfoCard";
import StatusBadge from "../components/StatusBadge";
import WindDirectionArrow from "../components/WindDirectionArrow";
import type { RootStackParamList } from "../navigation";
import { getBeachData } from "../services/api";
import type { BeachDataResponse } from "../types/beach";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

export default function DetailsScreen({ route }: Props): JSX.Element {
  const { beachName, lat, lon } = route.params;
  const [data, setData] = useState<BeachDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const payload = await getBeachData(lat, lon);
        setData(payload);
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Unexpected error";
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => {
      setError("Unexpected details load error");
    });
  }, [lat, lon]);

  const windDegrees = useMemo(() => (data ? data.wind_deg : 0), [data]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{beachName}</Text>

        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        {data ? (
          <>
            <StatusBadge status={data.status} />
            <Text style={styles.bestTime}>Best time: {data.best_time}</Text>

            <View style={styles.windRow}>
              <Text style={styles.windLabel}>Wind direction</Text>
              <WindDirectionArrow degrees={windDegrees} />
              <Text style={styles.windDeg}>{windDegrees.toFixed(0)}°</Text>
            </View>

            <View style={styles.grid}>
              <InfoCard label="Temperature" value={`${data.temp.toFixed(1)} °C`} />
              <InfoCard label="Wind Speed" value={`${data.wind.toFixed(1)} m/s`} />
              <InfoCard label="Wave Height" value={`${data.wave_height.toFixed(2)} m`} />
              <InfoCard label="Wave Period" value={`${data.wave_period.toFixed(1)} s`} />
              <InfoCard label="Wave Speed" value={`${data.wave_speed.toFixed(2)} m/s`} />
              <InfoCard label="Wave Force" value={`${data.wave_force.toFixed(2)}`} />
            </View>

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
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  bestTime: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  windRow: {
    alignItems: "center",
    marginBottom: 10,
  },
  windLabel: {
    fontSize: 14,
    color: "#475569",
  },
  windDeg: {
    fontSize: 18,
    fontWeight: "700",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summary: {
    marginTop: 8,
    color: "#334155",
    textAlign: "center",
    fontSize: 16,
  },
  error: {
    color: "#b91c1c",
    marginBottom: 12,
    textAlign: "center",
  },
});
