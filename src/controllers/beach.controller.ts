import { Request, Response } from "express";
import { BeachService } from "../services/beach.service";
import { getBestTimeOfDay } from "../utils/getBestTimeOfDay";
import { getBeachScore } from "../utils/getBeachScore";

const beachService = new BeachService();

export async function getBeach(req: Request, res: Response): Promise<void> {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    res.status(400).json({
      error: "Invalid query params. Please provide numeric lat and lon.",
    });
    return;
  }

  try {
    const beachData = await beachService.getBeachData(lat, lon);
    const status = getBeachScore(beachData.current);
    const bestTime = getBestTimeOfDay(beachData.periods);

    res.json({
      temp: beachData.current.temp,
      wind: beachData.current.wind,
      wave_height: beachData.current.waveHeight,
      status,
      best_time: bestTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    res.status(502).json({
      error: "Failed to fetch beach data",
      details: message,
    });
  }
}
