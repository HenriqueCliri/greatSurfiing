import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import { fetchBeachConditions } from "../services/api";
import { BeachResponse } from "../types/beach";

const DEFAULT_COORDS = {
  lat: 34.0195,
  lon: -118.4912,
};

interface UseBeachConditionsResult {
  data: BeachResponse | null;
  loading: boolean;
  error: string | null;
  locationText: string;
}

export function useBeachConditions(): UseBeachConditionsResult {
  const [data, setData] = useState<BeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Obtaining location...");

  const loadBeachData = useCallback(async (lat: number, lon: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchBeachConditions(lat, lon);
      setData(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unexpected error";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWithUserLocation = useCallback(async (): Promise<void> => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      setLocationText("Location permission denied. Using default coordinates.");
      await loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    const lat = Number(position.coords.latitude.toFixed(4));
    const lon = Number(position.coords.longitude.toFixed(4));

    setLocationText(`Lat ${lat}, Lon ${lon}`);
    await loadBeachData(lat, lon);
  }, [loadBeachData]);

  useEffect(() => {
    let isMounted = true;

    const start = async (): Promise<void> => {
      try {
        await loadWithUserLocation();
      } catch {
        if (!isMounted) {
          return;
        }

        setLocationText("Location unavailable. Using default coordinates.");
        await loadBeachData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      }
    };

    start().catch(() => {
      // Errors are handled in start.
    });

    return () => {
      isMounted = false;
    };
  }, [loadBeachData, loadWithUserLocation]);

  return {
    data,
    loading,
    error,
    locationText,
  };
}
