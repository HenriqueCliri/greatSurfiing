import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";
import DetailsScreen from "../screens/DetailsScreen";

export type RootStackParamList = {
  Home: undefined;
  Map:
    | {
        userLat: number;
        userLon: number;
      }
    | undefined;
  Details: {
    beachId: string;
    beachName: string;
    lat: number;
    lon: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Beach Conditions" }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: "Beach Map" }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: "Beach Details" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
