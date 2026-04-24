import HomeScreen from "./src/screens/HomeScreen";

const DEFAULT_COORDS = {
  lat: 34.0195,
  lon: -118.4912,
};

export default function App(): JSX.Element {
  return <HomeScreen lat={DEFAULT_COORDS.lat} lon={DEFAULT_COORDS.lon} />;
}
