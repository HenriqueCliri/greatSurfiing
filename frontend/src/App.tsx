import { useMemo, useState } from "react";

type Status = "GOOD" | "MEDIUM" | "BAD";
type BestTime = "MORNING" | "AFTERNOON" | "NIGHT";

interface BeachResponse {
  temp: number;
  wind: number;
  wave_height: number;
  status: Status;
  best_time: BestTime;
}

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
  const [lat, setLat] = useState("34.0195");
  const [lon, setLon] = useState("-118.4912");
  const [data, setData] = useState<BeachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => lat.trim().length > 0 && lon.trim().length > 0, [lat, lon]);

  const fetchBeach = async (): Promise<void> => {
    if (!canFetch) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/beach?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);

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
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Beach Conditions</h1>

        <div className="controls">
          <label>
            Latitude
            <input value={lat} onChange={(event) => setLat(event.target.value)} placeholder="e.g. 34.0195" />
          </label>

          <label>
            Longitude
            <input value={lon} onChange={(event) => setLon(event.target.value)} placeholder="e.g. -118.4912" />
          </label>

          <button onClick={fetchBeach} disabled={loading || !canFetch}>
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
          <p className="hint">Enter coordinates and fetch beach conditions.</p>
        )}
      </section>
    </main>
  );
}
