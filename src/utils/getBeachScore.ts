import { BeachData, BeachStatus } from "../types/beach";

export function getBeachScore(data: BeachData): BeachStatus {
  let score = 0;

  if (data.waveHeight >= 0.8 && data.waveHeight <= 1.5) {
    score += 2;
  }

  if (data.wind < 15) {
    score += 1;
  }

  if (data.wavePeriod > 7) {
    score += 1;
  }

  if (score >= 4) {
    return "GOOD";
  }

  if (score >= 2) {
    return "MEDIUM";
  }

  return "BAD";
}
