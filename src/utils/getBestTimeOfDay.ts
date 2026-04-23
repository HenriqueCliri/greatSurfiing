import { BeachData, BeachStatus, BestTime, PeriodBeachData } from "../types/beach";
import { getBeachScore } from "./getBeachScore";

const PERIOD_ORDER: BestTime[] = ["MORNING", "AFTERNOON", "NIGHT"];

function scoreToValue(status: BeachStatus): number {
  if (status === "GOOD") {
    return 3;
  }

  if (status === "MEDIUM") {
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

  entries.sort((left, right) => {
    const rightScore = scoreToValue(getBeachScore(right.data));
    const leftScore = scoreToValue(getBeachScore(left.data));
    const scoreDiff = rightScore - leftScore;

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const windDiff = left.data.wind - right.data.wind;
    if (windDiff !== 0) {
      return windDiff;
    }

    return PERIOD_ORDER.indexOf(left.period) - PERIOD_ORDER.indexOf(right.period);
  });

  return entries[0].period;
}
