export type BeachStatus = "GOOD" | "MEDIUM" | "BAD";
export type BestTimeOfDay = "MORNING" | "AFTERNOON" | "NIGHT";

export interface BeachDataResponse {
  temp: number;
  wind: number;
  wave_height: number;
  status: BeachStatus;
  best_time: BestTimeOfDay;
  summary: string;
}

interface ApiErrorPayload {
  error?: string;
  details?: string;
}

const BASE_URL = "http://localhost:3000";

function isBeachDataResponse(value: unknown): value is BeachDataResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.temp === "number" &&
    typeof data.wind === "number" &&
    typeof data.wave_height === "number" &&
    typeof data.status === "string" &&
    typeof data.best_time === "string" &&
    typeof data.summary === "string"
  );
}

function buildApiErrorMessage(payload: ApiErrorPayload | null, statusCode: number): string {
  return payload?.details || payload?.error || `Request failed with status ${statusCode}`;
}

export async function getBeachData(lat: number, lon: number): Promise<BeachDataResponse> {
  const endpoint = `${BASE_URL}/beach?lat=${encodeURIComponent(lat.toString())}&lon=${encodeURIComponent(lon.toString())}`;

  let response: Response;

  try {
    response = await fetch(endpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`Network error while fetching beach data: ${message}`);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(buildApiErrorMessage(payload, response.status));
  }

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!isBeachDataResponse(payload)) {
    throw new Error("Invalid API response format for beach data");
  }

  return payload;
}
