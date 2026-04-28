import { StyleSheet, Text, View } from "react-native";

interface WindDirectionArrowProps {
  degrees: number;
}

export default function WindDirectionArrow({ degrees }: WindDirectionArrowProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={[styles.arrow, { transform: [{ rotate: `${degrees}deg` }] }]}>↑</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 44,
    color: "#0f172a",
    fontWeight: "900",
  },
});
