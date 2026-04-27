import { Platform } from "react-native";
import { BeachResponse } from "../types/beach";

interface ApiErrorPayload {
  error?: string;
  details?: string;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseBeachResponse(value: unknown): BeachResponse | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;
  const temp = toFiniteNumber(data.temp);
  const wind = toFiniteNumber(data.wind);
  const waveHeight = toFiniteNumber(data.wave_height ?? data.waveHeight);
  const status = data.status;
  const bestTime = data.best_time ?? data.bestTime;
  const summary = data.summary;

  if (
    temp === null ||
    wind === null ||
    waveHeight === null ||
    typeof status !== "string" ||
    typeof bestTime !== "string" ||
    typeof summary !== "string"
  ) {
    return null;
  }

  return {
    temp,
    wind,
    wave_height: waveHeight,
    status: status as BeachResponse["status"],
    best_time: bestTime as BeachResponse["best_time"],
    summary,
  };
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

  const parsed = parseBeachResponse(await response.json().catch(() => null));

  if (!parsed) {
    throw new Error("Invalid API response format for beach conditions");
  }

  return parsed;
}
