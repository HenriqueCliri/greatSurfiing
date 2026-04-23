import { BeachData, BeachDataWithPeriods, PeriodBeachData } from "../types/beach";

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

type PeriodKey = keyof PeriodBeachData;

type PeriodBucket = {
  temp: number[];
  wind: number[];
  waveHeight: number[];
  wavePeriod: number[];
};

const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_BASE_URL = "https://marine-api.open-meteo.com/v1/marine";

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getHourFromIso(isoDate: string): number {
  return Number(isoDate.slice(11, 13));
}

function getPeriodFromHour(hour: number): PeriodKey {
  if (hour >= 6 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }

  return "night";
}

function createEmptyPeriodBuckets(): Record<PeriodKey, PeriodBucket> {
  return {
    morning: { temp: [], wind: [], waveHeight: [], wavePeriod: [] },
    afternoon: { temp: [], wind: [], waveHeight: [], wavePeriod: [] },
    night: { temp: [], wind: [], waveHeight: [], wavePeriod: [] },
  };
}

function assertHourlyFields(
  weather: OpenMeteoWeatherResponse,
  marine: OpenMeteoMarineResponse,
): {
  weatherTime: string[];
  weatherTemp: number[];
  weatherWind: number[];
  marineTime: string[];
  marineWaveHeight: number[];
  marineWavePeriod: number[];
} {
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

  return {
    weatherTime,
    weatherTemp,
    weatherWind,
    marineTime,
    marineWaveHeight,
    marineWavePeriod,
  };
}

function mapBucketToBeachData(bucket: PeriodBucket): BeachData {
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
}

function buildPeriodData(weather: OpenMeteoWeatherResponse, marine: OpenMeteoMarineResponse): PeriodBeachData {
  const hourly = assertHourlyFields(weather, marine);
  const buckets = createEmptyPeriodBuckets();

  const rowCount = Math.min(
    hourly.weatherTime.length,
    hourly.weatherTemp.length,
    hourly.weatherWind.length,
    hourly.marineTime.length,
    hourly.marineWaveHeight.length,
    hourly.marineWavePeriod.length,
  );

  for (let i = 0; i < rowCount; i += 1) {
    const period = getPeriodFromHour(getHourFromIso(hourly.weatherTime[i]));

    buckets[period].temp.push(hourly.weatherTemp[i]);
    buckets[period].wind.push(hourly.weatherWind[i]);
    buckets[period].waveHeight.push(hourly.marineWaveHeight[i]);
    buckets[period].wavePeriod.push(hourly.marineWavePeriod[i]);
  }

  return {
    morning: mapBucketToBeachData(buckets.morning),
    afternoon: mapBucketToBeachData(buckets.afternoon),
    night: mapBucketToBeachData(buckets.night),
  };
}

function buildWeatherUrl(lat: number, lon: number): string {
  return (
    `${WEATHER_BASE_URL}?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,wind_speed_10m" +
    "&hourly=temperature_2m,wind_speed_10m&wind_speed_unit=ms"
  );
}

function buildMarineUrl(lat: number, lon: number): string {
  return (
    `${MARINE_BASE_URL}?latitude=${lat}&longitude=${lon}` +
    "&current=wave_height,wave_period&hourly=wave_height,wave_period"
  );
}

function assertCurrentData(
  weather: OpenMeteoWeatherResponse,
  marine: OpenMeteoMarineResponse,
): BeachData {
  const temp = weather.current?.temperature_2m;
  const wind = weather.current?.wind_speed_10m;
  const waveHeight = marine.current?.wave_height;
  const wavePeriod = marine.current?.wave_period;

  if (
    temp === undefined ||
    wind === undefined ||
    waveHeight === undefined ||
    wavePeriod === undefined
  ) {
    throw new Error("Upstream API current data missing required fields");
  }

  return {
    temp,
    wind,
    waveHeight,
    wavePeriod,
  };
}

export class BeachService {
  async getBeachData(lat: number, lon: number): Promise<BeachDataWithPeriods> {
    const [weatherRes, marineRes] = await Promise.all([
      fetch(buildWeatherUrl(lat, lon)),
      fetch(buildMarineUrl(lat, lon)),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API request failed with status ${weatherRes.status}`);
    }

    if (!marineRes.ok) {
      throw new Error(`Marine API request failed with status ${marineRes.status}`);
    }

    const weatherJson = (await weatherRes.json()) as OpenMeteoWeatherResponse;
    const marineJson = (await marineRes.json()) as OpenMeteoMarineResponse;

    return {
      current: assertCurrentData(weatherJson, marineJson),
      periods: buildPeriodData(weatherJson, marineJson),
    };
  }
}
