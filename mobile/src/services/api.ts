import { Platform } from "react-native";
import { BeachResponse } from "../types/beach";

interface ApiErrorPayload {
  error?: string;
  details?: string;
}

function isBeachResponse(value: unknown): value is BeachResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.temp === "number" &&
    Number.isFinite(data.temp) &&
    typeof data.wind === "number" &&
    Number.isFinite(data.wind) &&
    typeof data.wave_height === "number" &&
    Number.isFinite(data.wave_height) &&
    typeof data.status === "string" &&
    typeof data.best_time === "string" &&
    typeof data.summary === "string"
  );
}

function normalizeBaseUrl(raw: string): string {
  const sanitized = raw.trim().replace(/\/+$/, "");

  try {
    const parsed = new URL(sanitized);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return sanitized;
  }
}

function resolveBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (envBaseUrl) {
    return normalizeBaseUrl(envBaseUrl);
  }

  // Android emulator cannot access localhost from host directly.
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

function toErrorMessage(payload: ApiErrorPayload | null, statusCode: number): string {
  return payload?.details || payload?.error || `Request failed with status ${statusCode}`;
}

function getConnectionHint(baseUrl: string): string {
  return (
    `Network request failed for ${baseUrl}. ` +
    "If using a physical device, set EXPO_PUBLIC_API_BASE_URL to your machine LAN IP (e.g. http://192.168.1.10:3000)."
  );
}

export async function fetchBeachConditions(lat: number, lon: number): Promise<BeachResponse> {
  const baseUrl = resolveBaseUrl();
  const responseUrl = `${baseUrl}/beach?lat=${encodeURIComponent(lat.toString())}&lon=${encodeURIComponent(lon.toString())}`;

  let response: Response;

  try {
    response = await fetch(responseUrl);
  } catch {
    throw new Error(getConnectionHint(baseUrl));
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new Error(toErrorMessage(payload, response.status));
  }

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!isBeachResponse(payload)) {
    throw new Error("Invalid API response format for beach conditions");
  }

  return payload;
}
