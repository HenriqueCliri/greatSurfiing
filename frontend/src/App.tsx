import { useCallback, useMemo, useState } from "react";
import { useEffect } from "react";

type Status = "GOOD" | "MEDIUM" | "BAD";
type BestTime = "MORNING" | "AFTERNOON" | "NIGHT";

interface BeachResponse {
  temp: number;
  wind: number;
  wave_height: number;
  status: Status;
  best_time: BestTime;
}

const DEFAULT_COORDS = {
  lat: "34.0195",
  lon: "-118.4912",
};

function getStatusClass(status: Status): string {
  if (status === "GOOD") {
    return "status good";
  }

  if (status === "MEDIUM") {
    return "status medium";
  }

  return "status bad";
}

export default function App(): JSX.Element {
  const [lat, setLat] = useState(DEFAULT_COORDS.lat);
  const [lon, setLon] = useState(DEFAULT_COORDS.lon);
  const [data, setData] = useState<BeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState("Getting your location...");

  const canFetch = useMemo(() => lat.trim().length > 0 && lon.trim().length > 0, [lat, lon]);

  const fetchBeach = useCallback(async (latValue: string, lonValue: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/beach?lat=${encodeURIComponent(latValue)}&lon=${encodeURIComponent(lonValue)}`);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
        const message = payload?.details || payload?.error || `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      const payload = (await response.json()) as BeachResponse;
      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation not supported. Using default coordinates.");
      fetchBeach(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude.toFixed(4);
        const userLon = position.coords.longitude.toFixed(4);

        setLat(userLat);
        setLon(userLon);
        setLocationMessage("Using your current location.");
        fetchBeach(userLat, userLon);
      },
      (geoError) => {
        setLat(DEFAULT_COORDS.lat);
        setLon(DEFAULT_COORDS.lon);
        setLocationMessage(`Location unavailable (${geoError.message}). Using default coordinates.`);
        fetchBeach(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      },
      {
        timeout: 8000,
      },
    );
  }, [fetchBeach]);

  return (
    <main className="page">
      <section className="card">
        <h1>Beach Conditions</h1>
        <p className="hint">{locationMessage}</p>

        <div className="controls">
          <label>
            Latitude
            <input value={lat} onChange={(event) => setLat(event.target.value)} placeholder="e.g. 34.0195" />
          </label>

          <label>
            Longitude
            <input value={lon} onChange={(event) => setLon(event.target.value)} placeholder="e.g. -118.4912" />
          </label>

          <button onClick={() => fetchBeach(lat, lon)} disabled={loading || !canFetch}>
            {loading ? "Loading..." : "Get Conditions"}
          </button>
        </div>

        {error ? <p className="error">Error: {error}</p> : null}

        {data ? (
          <div className="result">
            <p className="metric">
              <span>Temperature</span>
              <strong>{data.temp.toFixed(1)} °C</strong>
            </p>
            <p className="metric">
              <span>Wind</span>
              <strong>{data.wind.toFixed(1)} m/s</strong>
            </p>
            <p className="metric">
              <span>Wave Height</span>
              <strong>{data.wave_height.toFixed(2)} m</strong>
            </p>
            <p className={getStatusClass(data.status)}>{data.status}</p>
            <p className="best-time">
              Best Time: <strong>{data.best_time}</strong>
            </p>
          </div>
        ) : (
          <p className="hint">Fetching beach conditions...</p>
        )}
      </section>
    </main>
  );
}
