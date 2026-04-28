import { StyleSheet, Text, View } from "react-native";

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
}

export default function MetricCard({ icon, label, value }: MetricCardProps): JSX.Element {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#475569",
  },
  metricValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
});
