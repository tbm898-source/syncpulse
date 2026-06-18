# SyncPulse Local Bridge

Trusted local service on the streaming computer. Connects SyncPulse UI to OBS WebSocket and (later) Resolume, Kinect, MIDI, and OSC.

## Quick start

```bash
cd bridge
cp .env.example .env
npm install
npm run dev
```

Default URL: `http://127.0.0.1:9284`

## API (Milestone 2–3)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Bridge uptime and OBS connection summary |
| `GET` | `/version` | Bridge and API version |
| `GET` | `/v1/integrations` | Integration registry |
| `GET` | `/v1/obs/status` | OBS scenes, sources, stream/record state, stats |
| `GET` | `/v1/events` | Server-Sent Events live feed |
| `POST` | `/v1/obs/scene` | Set program scene `{ "sceneName": "..." }` |
| `POST` | `/v1/obs/stream/start` | Start streaming |
| `POST` | `/v1/obs/stream/stop` | Stop streaming |
| `POST` | `/v1/obs/record/start` | Start recording |
| `POST` | `/v1/obs/record/stop` | Stop recording |

## OBS setup

1. OBS Studio 28+ with WebSocket server enabled (Tools → WebSocket Server Settings).
2. Default port `4455`; set password in OBS and `OBS_PASSWORD` in `.env`.
3. Start OBS before or after the bridge — it reconnects automatically.

## Security

- Binds to loopback (`127.0.0.1`) by default.
- Optional `BRIDGE_API_TOKEN` requires `Authorization: Bearer <token>`.
- CORS limited to configured UI origins.

## UI development

From the repo root, Vite proxies `/bridge-api` → `http://127.0.0.1:9284` when `VITE_BRIDGE_PROXY_PREFIX=/bridge-api` is set.
