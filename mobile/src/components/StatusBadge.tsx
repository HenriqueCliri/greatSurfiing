import { StyleSheet, Text } from "react-native";
import { BeachStatus } from "../types/beach";

interface StatusBadgeProps {
  status: BeachStatus;
}

function getColor(status: BeachStatus): string {
  if (status === "GOOD") {
    return "#16a34a";
  }

  if (status === "MEDIUM") {
    return "#ca8a04";
  }

  return "#dc2626";
}

export default function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  return <Text style={[styles.status, { color: getColor(status) }]}>{status}</Text>;
}

const styles = StyleSheet.create({
  status: {
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
});
