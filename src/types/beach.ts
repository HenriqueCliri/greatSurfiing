export interface BeachData {
  temp: number;
  wind: number;
  waveHeight: number;
  wavePeriod: number;
}

export type BeachStatus = "GOOD" | "MEDIUM" | "BAD";

export interface BeachResponse {
  temp: number;
  wind: number;
  wave_height: number;
  status: BeachStatus;
}
