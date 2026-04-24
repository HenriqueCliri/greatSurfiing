export type BeachStatus = "GOOD" | "MEDIUM" | "BAD";
export type BestTime = "MORNING" | "AFTERNOON" | "NIGHT";

export interface BeachResponse {
  temp: number;
  wind: number;
  wave_height: number;
  status: BeachStatus;
  best_time: BestTime;
  summary: string;
}
