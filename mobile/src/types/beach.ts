export type BeachStatus = "GOOD" | "MEDIUM" | "BAD";
export type BestTime = "MORNING" | "AFTERNOON" | "NIGHT";

export interface BeachDataResponse {
  temp: number;
  wind: number;
  wind_deg: number;
  wave_height: number;
  wave_period: number;
  wave_speed: number;
  wave_force: number;
  status: BeachStatus;
  best_time: BestTime;
  summary: string;
}

export interface BeachMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
}
