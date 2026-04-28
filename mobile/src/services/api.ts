import { Platform } from "react-native";
import type { BeachDataResponse } from "../types/beach";

const LOCAL_IP = "<LOCAL_IP>";

function resolveBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }

  if (LOCAL_IP !== "<LOCAL_IP>") {
    return `http://${LOCAL_IP}:3000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

interface ApiErrorPayload {
  error?: string;
  details?: string;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseBeachResponse(payload: unknown): BeachDataResponse | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const temp = toNumber(data.temp);
  const wind = toNumber(data.wind);
  const windDeg = toNumber(data.wind_deg) ?? 0;
  const waveHeight = toNumber(data.wave_height);
  const wavePeriod = toNumber(data.wave_period) ?? toNumber(data.wavePeriod) ?? 0;
  const waveSpeed = toNumber(data.wave_speed) ?? toNumber(data.waveSpeed) ?? waveHeight ?? 0;
  const waveForce = toNumber(data.wave_force) ?? toNumber(data.waveForce) ?? waveSpeed * (waveHeight ?? 0);

  if (
    temp === null ||
    wind === null ||
    waveHeight === null ||
    !Number.isFinite(wavePeriod) ||
    !Number.isFinite(waveSpeed) ||
    !Number.isFinite(waveForce) ||
    typeof data.status !== "string" ||
    typeof data.best_time !== "string" ||
    typeof data.summary !== "string"
  ) {
    return null;
  }

  return {
    temp,
    wind,
    wind_deg: windDeg,
    wave_height: waveHeight,
    wave_period: wavePeriod,
    wave_speed: waveSpeed,
    wave_force: waveForce,
    status: data.status as BeachDataResponse["status"],
    best_time: data.best_time as BeachDataResponse["best_time"],
    summary: data.summary,
  };
}

function toErrorMessage(payload: ApiErrorPayload | null, statusCode: number): string {
  return payload?.details || payload?.error || `Request failed with status ${statusCode}`;
}

export async function getBeachData(lat: number, lon: number): Promise<BeachDataResponse> {
  const baseUrl = resolveBaseUrl();
  const endpoint = `${baseUrl}/beach?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;

  let response: Response;

  try {
    response = await fetch(endpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`Network request failed for ${baseUrl}: ${message}`);
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

export { LOCAL_IP };
