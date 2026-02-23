# Transistor Diagram to LaTeX

A full-stack circuit editor prototype that converts transistor/circuit diagrams into LaTeX `circuitikz` code.

The project includes:
- A **React + Konva** frontend for drawing circuit elements on a grid.
- A **Go (Gin)** backend that validates diagram payloads and exports CircuiTikZ.

## Status

This repository is an active prototype.

Implemented today:
- Interactive canvas with pan/zoom, grid snapping, selection, drag, undo/redo, and delete.
- Quick-add toolbar for `NMOS`, `PMOS`, `GND`, and `RGND`.
- Backend exporter endpoint (`POST /api/export`) producing CircuiTikZ output.
- Health and component-library endpoints.

Not fully wired yet:
- Frontend export flow to call the backend and display/copy generated LaTeX.
- End-to-end wire creation UX (wire rendering exists; creation flow is still incomplete).

## Monorepo Structure

```text
.
├─ backend/                 # Go API + CircuiTikZ exporter
│  ├─ export/circuitikz.go  # Core conversion logic
│  ├─ models/diagram.go     # Request/response and diagram schema
│  ├─ main.go               # Gin server bootstrap
│  └─ routes.go             # /api/health, /api/components, /api/export
├─ frontend/                # React + TypeScript + Vite canvas app
│  └─ src/
│     ├─ components/        # Canvas, toolbar, renderers
│     ├─ stores/            # Zustand diagram store
│     ├─ types/             # Shared diagram types
│     └─ api/client.ts      # Backend API client (ready, not yet integrated in UI)
├─ docker-compose.yml
└─ package.json             # Root scripts
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, react-konva, Zustand
- **Backend:** Go 1.25, Gin
- **Dev tooling:** pnpm workspaces, Docker Compose, Biome, ESLint

## Prerequisites

### Option A: Docker (recommended)
- Docker Desktop
- Docker Compose

### Option B: Local runtime
- Node.js 20+
- pnpm
- Go 1.25+

## Running the Project

### 1) With Docker Compose

From repository root:

```bash
pnpm docker:build
pnpm docker:up
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

Stop:

```bash
pnpm docker:down
```

### 2) Local development (without Docker)

Install root dependency:

```bash
pnpm install
```

Run frontend:

```bash
pnpm dev:frontend
```

Run backend (second terminal):

```bash
pnpm dev:backend
```

> Note: the current root `dev` script is recursive and should not be used as-is.

## Available Root Scripts

- `pnpm dev:frontend` — starts Vite frontend
- `pnpm dev:backend` — runs Go backend (`go run .` in `backend/`)
- `pnpm build` — builds frontend
- `pnpm lint` — lints frontend
- `pnpm preview` — previews frontend production build
- `pnpm docker:build` — builds Docker images
- `pnpm docker:up` — starts Docker Compose stack
- `pnpm docker:down` — stops Docker Compose stack

## API

Base URL: `http://localhost:8080`

### `GET /api/health`

Returns service health.

### `GET /api/components`

Returns available backend component-to-CircuiTikZ mappings.

### `POST /api/export`

Converts a diagram JSON payload into CircuiTikZ LaTeX.

Example request:

```json
{
	"diagram": {
		"components": [
			{ "id": "comp_1", "type": "nmos", "x": 200, "y": 200, "rotation": 0, "label": "M1", "value": "" },
			{ "id": "comp_2", "type": "ground", "x": 300, "y": 300, "rotation": 0, "label": "", "value": "" }
		],
		"connections": [
			{
				"id": "conn_1",
				"source": { "componentId": "comp_1", "position": "right" },
				"target": { "componentId": "comp_2", "position": "top" },
				"waypoints": []
			}
		],
		"gridSize": 50,
		"zoom": 1
	},
	"includeHeader": true,
	"scale": 50
}
```

Example success response:

```json
{
	"success": true,
	"latex": "\\documentclass{article}..."
}
```

Validation notes:
- `diagram.components` must contain at least one component.
- `scale` defaults to `50` when not provided.

## Supported Component Types (backend mapping)

- Transistors: `npn`, `pnp`, `nmos`, `pmos`
- Passive: `resistor`, `capacitor`, `inductor`
- Sources: `dc_voltage`, `dc_current`, `ac_voltage`, `battery`
- Semiconductor: `diode`, `led`, `zener`
- Basic: `ground`, `rground`, `junction`
- Active: `opamp`, `switch`

## Interaction Shortcuts (frontend)

- `Mouse wheel` — zoom in/out
- `Space + drag` — pan canvas
- `Delete` / `Backspace` — delete selected components/connections
- `Ctrl/Cmd + Z` — undo
- `Ctrl/Cmd + Y` (or `Cmd/Ctrl + Shift + Z`) — redo
- `Esc` — clear selection

## Troubleshooting

- If frontend cannot reach backend, verify backend is running on `:8080`.
- If Docker frontend fails to resolve API, check `VITE_API_URL` in `docker-compose.yml`.
- If Go dependencies fail locally, run inside `backend/`:

```bash
go mod download
```

## Next Milestones

- Integrate export button/modal in frontend using `frontend/src/api/client.ts`
- Add wire-creation interactions in canvas and port-level UX
- Add persistence (save/load diagram JSON)
- Add automated tests for exporter and API routes