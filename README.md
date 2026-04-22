# Beach Conditions App (Backend + Frontend)

## Backend (Node.js + TypeScript + Express)

### Features
- `GET /beach?lat={lat}&lon={lon}`
- Fetches weather data (temperature, wind speed)
- Fetches marine data (wave height, wave period)
- Computes beach status (`GOOD`, `MEDIUM`, `BAD`) from business rules
- Computes `best_time` (`MORNING`, `AFTERNOON`, `NIGHT`) from hourly data

### Business scoring rules
- wave height between `0.8` and `1.5` → `+2`
- wind speed `< 15` → `+1`
- wave period `> 7` → `+1`

Status mapping:
- `GOOD` if score >= 4
- `MEDIUM` if score >= 2
- `BAD` otherwise

### Best time calculation
- Day split into:
  - `MORNING` (06:00-11:59)
  - `AFTERNOON` (12:00-17:59)
  - `NIGHT` (18:00-05:59)
- For each period, hourly weather + marine values are averaged.
- `getBeachScore` is applied to each period.
- Highest period wins (tie-breaker: lower wind, then MORNING > AFTERNOON > NIGHT).

### Backend start
```bash
npm install
npm run dev
```

Backend runs at `http://localhost:3000`.

---

## Frontend (React + Vite + TypeScript)

### Features
- Single-page UI
- Calls backend `/beach` endpoint
- Displays:
  - temperature
  - wind
  - wave height
  - status (large text with color)
  - best time
- Shows loading state and API errors

### Frontend start
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/beach` requests to backend port `3000`.

---

## File structure
```txt
.
├─ src/                         # backend source
│  ├─ app.ts
│  ├─ server.ts
│  ├─ controllers/
│  │  └─ beach.controller.ts
│  ├─ routes/
│  │  └─ beach.routes.ts
│  ├─ services/
│  │  └─ beach.service.ts
│  ├─ types/
│  │  └─ beach.ts
│  └─ utils/
│     ├─ getBeachScore.ts
│     └─ getBestTimeOfDay.ts
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  └─ src/
│     ├─ main.tsx
│     ├─ App.tsx
│     └─ styles.css
├─ package.json                 # backend package
└─ tsconfig.json                # backend TypeScript config
```

## Example backend response
```json
{
  "temp": 18.2,
  "wind": 6.5,
  "wave_height": 1.1,
  "status": "GOOD",
  "best_time": "MORNING"
}
```
