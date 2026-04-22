# Beach Conditions Backend (Node.js + TypeScript + Express)

## Features
- `GET /beach?lat={lat}&lon={lon}`
- Fetches weather data (temperature, wind speed)
- Fetches marine data (wave height, wave period)
- Computes beach status (`GOOD`, `MEDIUM`, `BAD`) from business rules

## Business scoring rules
- wave height between `0.8` and `1.5` → `+2`
- wind speed `< 15` → `+1`
- wave period `> 7` → `+1`

Status mapping:
- `GOOD` if score >= 4
- `MEDIUM` if score >= 2
- `BAD` otherwise

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
  "status": "GOOD"
}
```

## Error handling
- Returns `400` if `lat` or `lon` are missing/invalid.
- Returns `502` if upstream APIs fail or return incomplete data.
