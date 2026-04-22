# Beach Conditions Backend (Node.js + TypeScript + Express)

## Features
- `GET /beach?lat={lat}&lon={lon}`
- Fetches weather data (temperature, wind speed)
- Fetches marine data (wave height, wave period)
- Computes beach status (`GOOD`, `MEDIUM`, `BAD`) from business rules
- Computes `best_time` (`MORNING`, `AFTERNOON`, `NIGHT`) from hourly data

## Business scoring rules
- wave height between `0.8` and `1.5` → `+2`
- wind speed `< 15` → `+1`
- wave period `> 7` → `+1`

Status mapping:
- `GOOD` if score >= 4
- `MEDIUM` if score >= 2
- `BAD` otherwise

## Best time calculation
- Day split into:
  - `MORNING` (06:00-11:59)
  - `AFTERNOON` (12:00-17:59)
  - `NIGHT` (18:00-05:59)
- For each period, hourly weather + marine values are averaged.
- `getBeachScore` is applied to each period.
- Highest period wins (tie-breaker: lower wind, then MORNING > AFTERNOON > NIGHT).

## Start server
```bash
npm install
npm run dev
```

Server runs by default at `http://localhost:3000`.

## Build and run production
```bash
npm run build
npm start
```

## Example request
```bash
curl "http://localhost:3000/beach?lat=34.0195&lon=-118.4912"
```

## Example response
```json
{
  "temp": 18.2,
  "wind": 6.5,
  "wave_height": 1.1,
  "status": "GOOD",
  "best_time": "MORNING"
}
```

## Error handling
- Returns `400` if `lat` or `lon` are missing/invalid.
- Returns `502` if upstream APIs fail or return incomplete data.
