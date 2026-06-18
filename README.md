# SyncPulse

SyncPulse is a guided live-stream production system for DJs, performers, makers, educators, and small production teams.

It helps users combine live video, DJ or microphone audio, Resolume visuals, Kinect-driven visuals, overlays, and streaming destinations without requiring them to manually coordinate several disconnected production tools.

## Product purpose

SyncPulse is designed for two primary workflows:

1. **Solo streaming** — stream a DJ set, maker session, lesson, or performance to Twitch, YouTube, or another RTMP-compatible destination.
2. **Event broadcasting** — stream an in-person performance, workshop, or small event to the web using cameras, live audio, Resolume, Kinect visuals, overlays, and recording.

SyncPulse does not replace OBS, Resolume, Processing, Kinect software, or the user's audio tools. It coordinates them through one guided workflow.

## Intended signal path

```text
Cameras --------------------------┐
DJ audio / microphone ------------┤
Kinect -> Processing -> Spout ----┤
Resolume visuals -> Spout / NDI --┤
Overlays and media ----------------┤
                                  v
                            OBS / encoder
                                  |
                                  v
                      Twitch / YouTube / RTMP
```

## Current state

The current repository is a Vite + React + Base44 prototype containing:

- dashboard and session UI
- streaming-platform configuration
- Resolume Web Remote panel
- Kinect controls and visual preview components
- OSC preset management
- MIDI mapping helpers
- Go Live workflow shell

Several current signals remain simulated or browser-local. The application is not yet a complete production streaming system.

Known prototype-only paths include:

- simulated BPM and audio values
- simulated preflight checks
- simulated OSC results
- generated point-cloud preview data
- direct browser assumptions for local Resolume access
- no OBS WebSocket integration
- no packaged local bridge
- no installer or automatic background service

Mocked and simulated states must remain visibly labeled until replaced by live integrations.

## Production architecture

SyncPulse should use two cooperating applications.

### SyncPulse UI

The React/Base44 application owns:

- stream setup wizard
- source and scene selection
- preview and program status
- show or stream profiles
- preflight checks
- platform configuration
- operator guidance
- stream health display
- session history and reports

### SyncPulse Local Bridge

A trusted service running on the streaming computer owns:

- OBS WebSocket connection
- Resolume Web Remote and OSC communication
- MIDI discovery and routing
- Processing / Kinect heartbeat
- Spout or NDI source health where detectable
- audio-device discovery
- local event collection
- secure storage of machine-local credentials
- live state delivery to the UI

The browser UI must not store machine credentials or attempt unrestricted direct access to every local device.

## First production vertical slice

The first usable release should prove this complete path:

```text
SyncPulse UI
  -> SyncPulse Local Bridge
  -> OBS WebSocket
  -> scenes, sources, stream state, recording, and health
  -> live state returned to SyncPulse
```

This slice should include:

1. Local bridge health endpoint.
2. OBS connection setup.
3. Scene and source inventory.
4. Preview of current program state.
5. Start and stop recording.
6. Start and stop streaming with confirmation.
7. Bitrate, dropped frames, output status, and audio-presence indicators.
8. Explicit disconnected, stale, simulated, and live states.
9. Session logging.
10. A guided preflight workflow.

Resolume and Kinect integrations follow after the OBS path is reliable.

## Development order

### Phase 0: stabilize the prototype

- add tests and CI
- validate host and port fields
- label every simulated state
- remove false connected states
- add error boundaries
- document Base44 entities
- protect stream credentials

### Phase 1: local bridge and OBS

- bridge health and version API
- OBS WebSocket adapter
- scenes and sources
- recording and stream state
- output health
- reconnect and stale-state handling

### Phase 2: guided stream builder

- destination selection
- camera and audio selection
- scene templates
- resolution and bitrate guidance
- test-record workflow
- reusable stream profiles

### Phase 3: Resolume

- connection state
- active composition and deck
- layers and clips
- output-source readiness
- approved actions through the bridge

### Phase 4: Kinect and visual pipeline

- Processing heartbeat
- Kinect tracking status
- active visual mode
- Spout-source readiness
- Resolume receiving-state guidance
- fallback visual source

### Phase 5: MIDI and OSC

- real device discovery
- validated mappings
- OSC send and receive
- preset import and export
- action logging

### Phase 6: packaging

- Windows installer for the local bridge
- automatic startup
- secure local configuration
- diagnostics bundle
- signed releases
- update and recovery strategy

### Phase 7: companion clients

After the local bridge and web application work reliably:

- Android companion remote
- tablet operator layout
- local-network discovery
- limited remote scene and health controls
- no stream keys stored on the mobile device

## Why Android is later

Resolume, OBS, Spout, Kinect, audio interfaces, and most DJ workflows execute on the streaming computer. Android is valuable as a remote operator surface, but it cannot replace the local bridge or desktop integration layer.

Building Android first would preserve the same unresolved integration boundary behind a different screen.

## Local development

Requirements:

- Node.js 18+
- Base44 application configuration
- Windows streaming computer for the full future integration path

Install and run:

```bash
npm install
npm run dev
```

Optional Base44 environment values:

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

The existing Vite Resolume proxy is suitable for development only. Production integration should move through the SyncPulse Local Bridge.

## Deployment

Current Base44 deployment:

- Base44 application: `https://sync-pulse-stream.base44.app`
- Custom domain: `https://www.syncpulsestream.com`

Confirm domain and deployment settings in Base44 and IONOS before changing DNS or publication configuration.

## Documentation

- [Product Architecture](docs/product-architecture.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)

## Product statement

> Build the stream, connect the visuals, and go live.
