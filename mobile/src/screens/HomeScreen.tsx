import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import InfoCard from "../components/InfoCard";
import StatusBadge from "../components/StatusBadge";
import { getBeachData } from "../services/api";
import { BeachDataResponse } from "../types/beach";
import { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props): JSX.Element {
  const [data, setData] = useState<BeachDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Getting location...");
  const [coords, setCoords] = useState({ lat: -3.7, lon: -38.5 });

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        let lat = coords.lat;
        let lon = coords.lon;

        if (permission.status === "granted") {
          const position = await Location.getCurrentPositionAsync({});
          lat = Number(position.coords.latitude.toFixed(5));
          lon = Number(position.coords.longitude.toFixed(5));
          setLocationText(`Lat ${lat}, Lon ${lon}`);
        } else {
          setLocationText("Location denied. Using fallback coordinates.");
        }

        setCoords({ lat, lon });
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
      setError("Unexpected initialization error");
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Beach Conditions</Text>
        <Text style={styles.location}>{locationText}</Text>

        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>Error: {error}</Text> : null}

        {data ? (
          <>
            <StatusBadge status={data.status} />
            <Text style={styles.bestTime}>Best time: {data.best_time}</Text>

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

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Map", { userLat: coords.lat, userLon: coords.lon })}
        >
          <Text style={styles.buttonText}>Open Map</Text>
        </Pressable>
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
  },
  location: {
    marginTop: 6,
    marginBottom: 12,
    color: "#64748b",
  },
  bestTime: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
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
  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#b91c1c",
    marginBottom: 12,
    textAlign: "center",
  },
});
