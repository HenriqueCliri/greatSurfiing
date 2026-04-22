export interface BeachData {
  temp: number;
  wind: number;
  waveHeight: number;
  wavePeriod: number;
}

export type BeachStatus = "GOOD" | "MEDIUM" | "BAD";
export type BestTime = "MORNING" | "AFTERNOON" | "NIGHT";

export interface BeachResponse {
  temp: number;
  wind: number;
  wave_height: number;
  status: BeachStatus;
  best_time: BestTime;
}

export interface PeriodBeachData {
  morning: BeachData;
  afternoon: BeachData;
  night: BeachData;
}

export interface BeachDataWithPeriods {
  current: BeachData;
  periods: PeriodBeachData;
}
