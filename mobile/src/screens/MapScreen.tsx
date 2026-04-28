import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { BeachMarker } from "../types/beach";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

const MOCK_BEACHES: BeachMarker[] = [
  { id: "1", name: "Praia A", lat: -3.7, lon: -38.5 },
  { id: "2", name: "Praia B", lat: -3.71, lon: -38.52 },
];

export default function MapScreen({ navigation, route }: Props): JSX.Element {
  const { userLat, userLon } = route.params;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: userLat,
          longitude: userLon,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {MOCK_BEACHES.map((beach) => (
          <Marker
            key={beach.id}
            coordinate={{ latitude: beach.lat, longitude: beach.lon }}
            title={beach.name}
            onPress={() =>
              navigation.navigate("Details", {
                beachId: beach.id,
                beachName: beach.name,
                lat: beach.lat,
                lon: beach.lon,
              })
            }
          />
        ))}
      </MapView>

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>Tap a marker to open beach details.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  hintBox: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.86)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  hintText: {
    color: "#ffffff",
    textAlign: "center",
  },
});
