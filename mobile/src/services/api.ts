import { BeachResponse } from "../types/beach";

// Use your machine IP when testing on a real device.
const BASE_URL = "http://localhost:3000";

interface ApiErrorPayload {
  error?: string;
  details?: string;
}

function toErrorMessage(payload: ApiErrorPayload | null, statusCode: number): string {
  return payload?.details || payload?.error || `Request failed with status ${statusCode}`;
}

export async function fetchBeachConditions(lat: number, lon: number): Promise<BeachResponse> {
  const response = await fetch(
    `${BASE_URL}/beach?lat=${encodeURIComponent(lat.toString())}&lon=${encodeURIComponent(lon.toString())}`,
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(toErrorMessage(payload, response.status));
  }

  return (await response.json()) as BeachResponse;
}
