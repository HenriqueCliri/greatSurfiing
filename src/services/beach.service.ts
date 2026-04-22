import { BeachData, BeachDataWithPeriods } from "../types/beach";

interface OpenMeteoWeatherResponse {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    wind_speed_10m?: number[];
  };
}

interface OpenMeteoMarineResponse {
  current?: {
    wave_height?: number;
    wave_period?: number;
  };
  hourly?: {
    time?: string[];
    wave_height?: number[];
    wave_period?: number[];
  };
}

function getHourFromIso(iso: string): number {
  return Number(iso.slice(11, 13));
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildPeriodData(
  weather: OpenMeteoWeatherResponse,
  marine: OpenMeteoMarineResponse,
): { morning: BeachData; afternoon: BeachData; night: BeachData } {
  const weatherTime = weather.hourly?.time;
  const weatherTemp = weather.hourly?.temperature_2m;
  const weatherWind = weather.hourly?.wind_speed_10m;
  const marineTime = marine.hourly?.time;
  const marineWaveHeight = marine.hourly?.wave_height;
  const marineWavePeriod = marine.hourly?.wave_period;

  if (
    !weatherTime ||
    !weatherTemp ||
    !weatherWind ||
    !marineTime ||
    !marineWaveHeight ||
    !marineWavePeriod ||
    weatherTime.length === 0 ||
    marineTime.length === 0
  ) {
    throw new Error("Upstream API hourly data missing required fields");
  }

  const periods = {
    morning: { temp: [] as number[], wind: [] as number[], waveHeight: [] as number[], wavePeriod: [] as number[] },
    afternoon: { temp: [] as number[], wind: [] as number[], waveHeight: [] as number[], wavePeriod: [] as number[] },
    night: { temp: [] as number[], wind: [] as number[], waveHeight: [] as number[], wavePeriod: [] as number[] },
  };

  const length = Math.min(
    weatherTime.length,
    weatherTemp.length,
    weatherWind.length,
    marineTime.length,
    marineWaveHeight.length,
    marineWavePeriod.length,
  );

  for (let i = 0; i < length; i += 1) {
    const hour = getHourFromIso(weatherTime[i]);

    let target: keyof typeof periods = "night";
    if (hour >= 6 && hour < 12) {
      target = "morning";
    } else if (hour >= 12 && hour < 18) {
      target = "afternoon";
    }

    periods[target].temp.push(weatherTemp[i]);
    periods[target].wind.push(weatherWind[i]);
    periods[target].waveHeight.push(marineWaveHeight[i]);
    periods[target].wavePeriod.push(marineWavePeriod[i]);
  }

  const toBeachData = (bucket: (typeof periods)["morning"]): BeachData => {
    if (
      bucket.temp.length === 0 ||
      bucket.wind.length === 0 ||
      bucket.waveHeight.length === 0 ||
      bucket.wavePeriod.length === 0
    ) {
      throw new Error("Insufficient hourly data to compute all day periods");
    }

    return {
      temp: average(bucket.temp),
      wind: average(bucket.wind),
      waveHeight: average(bucket.waveHeight),
      wavePeriod: average(bucket.wavePeriod),
    };
  };

  return {
    morning: toBeachData(periods.morning),
    afternoon: toBeachData(periods.afternoon),
    night: toBeachData(periods.night),
  };
}

export class BeachService {
  async getBeachData(lat: number, lon: number): Promise<BeachDataWithPeriods> {
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,wind_speed_10m" +
      "&hourly=temperature_2m,wind_speed_10m&wind_speed_unit=ms";

    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
      "&current=wave_height,wave_period&hourly=wave_height,wave_period";

    const [weatherRes, marineRes] = await Promise.all([fetch(weatherUrl), fetch(marineUrl)]);

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
      throw new Error("Upstream API current data missing required fields");
    }

    return {
      current: {
        temp,
        wind,
        waveHeight,
        wavePeriod,
      },
      periods: buildPeriodData(weatherJson, marineJson),
    };
  }
}
