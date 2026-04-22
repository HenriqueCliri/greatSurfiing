import { BeachData } from "../types/beach";

interface OpenMeteoWeatherResponse {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
  };
}

interface OpenMeteoMarineResponse {
  current?: {
    wave_height?: number;
    wave_period?: number;
  };
}

export class BeachService {
  async getBeachData(lat: number, lon: number): Promise<BeachData> {
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,wind_speed_10m&wind_speed_unit=ms";

    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
      "&current=wave_height,wave_period";

    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(marineUrl),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API request failed with status ${weatherRes.status}`);
    }

    if (!marineRes.ok) {
      throw new Error(`Marine API request failed with status ${marineRes.status}`);
    }

    const weatherJson = (await weatherRes.json()) as OpenMeteoWeatherResponse;
    const marineJson = (await marineRes.json()) as OpenMeteoMarineResponse;

    const temp = weatherJson.current?.temperature_2m;
    const wind = weatherJson.current?.wind_speed_10m;
    const waveHeight = marineJson.current?.wave_height;
    const wavePeriod = marineJson.current?.wave_period;

    if (
      temp === undefined ||
      wind === undefined ||
      waveHeight === undefined ||
      wavePeriod === undefined
    ) {
      throw new Error("Upstream API response missing required fields");
    }

    return {
      temp,
      wind,
      waveHeight,
      wavePeriod,
    };
  }
}
