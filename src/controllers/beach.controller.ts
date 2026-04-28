import { Request, Response } from "express";
import { BeachResponse } from "../types/beach";
import { BeachService } from "../services/beach.service";
import { getBestTimeOfDay } from "../utils/getBestTimeOfDay";
import { getBeachScore } from "../utils/getBeachScore";
import { getBeachSummary } from "../utils/getBeachSummary";

const beachService = new BeachService();

function parseCoordinate(value: unknown): number {
  return Number(value);
}

function buildBeachResponse(data: Awaited<ReturnType<BeachService["getBeachData"]>>): BeachResponse {
  const { current, periods } = data;
  const status = getBeachScore(current);

  return {
    temp: current.temp,
    wind: current.wind,
    wave_height: current.waveHeight,
    status,
    best_time: getBestTimeOfDay(periods),
    summary: getBeachSummary({
      temp: current.temp,
      wind: current.wind,
      wave_height: current.waveHeight,
      status,
    }),
  };
}

export async function getBeach(req: Request, res: Response): Promise<void> {
  const lat = parseCoordinate(req.query.lat);
  const lon = parseCoordinate(req.query.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    res.status(400).json({
      error: "Invalid query params. Please provide numeric lat and lon.",
    });
    return;
  }

  try {
    const beachData = await beachService.getBeachData(lat, lon);
    res.json(buildBeachResponse(beachData));
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unexpected error";

    res.status(502).json({
      error: "Failed to fetch beach data",
      details,
    });
  }
}
