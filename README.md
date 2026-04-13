# SyncPulse

Live show **control dashboard** (Vite + React + Base44): preflight, platforms, Kinect UI, Go Live session, **Resolume Arena** Web Remote panel, MIDI mapping helpers.

**Production (Base44):** [https://sync-pulse-stream.base44.app](https://sync-pulse-stream.base44.app)  
*(Resolume “Connected” only works when the browser can reach your Resolume Web Remote — usually same PC + proxy, or a tunnel; see Setup below.)*

**You still run** Processing + Kinect + Spout → Resolume; this app is the **browser shell** around the workflow.

## Prerequisites

- Node 18+  
- [Base44](https://base44.com) app (for entities / backend) or adapt client for your API  
- **Resolume Arena** with **Web Remote** enabled (default HTTP **8080**; OSC is separate, often **7000** UDP)

## Setup

1. Clone and `cd` into the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and set:

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

1. **Local Resolume without CORS pain:** add to `.env.local`:

```env
VITE_RESOLUME_PROXY_PREFIX=/resolume-api
```

Then `npm run dev` — Vite proxies `/resolume-api` → `http://127.0.0.1:8080`.

1. Open the app URL from the terminal (usually `http://localhost:5173`).

## Useful routes

- **Dashboard** — command center, Resolume panel, audio/Kinect previews when session is live  
- **Go Live** — session create; new sessions use `resolume_port: 8080` and `osc_port: 7000`  
- **Kinect** — controls + OSC bridge test note

## Publish (Base44)

Push to GitHub and use **Publish** in the Base44 builder, or your linked workflow.

## Docs

- [Base44 + GitHub](https://docs.base44.com/Integrations/Using-GitHub)  
- [Base44 support](https://app.base44.com/support)

## Digital product / license (if you sell this template)

**Suggested support line:**  
*“Digital template: refund within 14 days if you cannot run `npm install && npm run dev` after following this README and `.env.example`; support via seller email.”*

Replace Base44 env values with **your** app or document a fork path if buyers self-host without Base44.