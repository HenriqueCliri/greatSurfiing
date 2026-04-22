import { BeachData, BestTime, PeriodBeachData } from "../types/beach";
import { getBeachScore } from "./getBeachScore";

const PERIOD_ORDER: BestTime[] = ["MORNING", "AFTERNOON", "NIGHT"];

function scoreToValue(score: ReturnType<typeof getBeachScore>): number {
  if (score === "GOOD") {
    return 3;
  }

  if (score === "MEDIUM") {
    return 2;
  }

  return 1;
}

function toEntries(periods: PeriodBeachData): Array<{ period: BestTime; data: BeachData }> {
  return [
    { period: "MORNING", data: periods.morning },
    { period: "AFTERNOON", data: periods.afternoon },
    { period: "NIGHT", data: periods.night },
  ];
}

export function getBestTimeOfDay(periods: PeriodBeachData): BestTime {
  const entries = toEntries(periods);

  entries.sort((a, b) => {
    const scoreDiff = scoreToValue(getBeachScore(b.data)) - scoreToValue(getBeachScore(a.data));

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    // tie-break by wind preference (lower wind is better)
    const windDiff = a.data.wind - b.data.wind;
    if (windDiff !== 0) {
      return windDiff;
    }

    // deterministic fallback: MORNING -> AFTERNOON -> NIGHT
    return PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period);
  });

  return entries[0].period;
}
