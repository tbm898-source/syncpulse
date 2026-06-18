# SyncPulse Implementation Roadmap

## Immediate milestone

Deliver a reliable OBS-controlled streaming vertical slice before expanding the current UI.

## Milestone 1: repository truth

- inventory Base44 entities
- inventory all routes and components
- identify simulated values
- establish `.env.example`
- add Vitest
- add Playwright smoke tests
- add GitHub Actions CI
- add explicit product and architecture documentation

Acceptance criteria:

- production build passes
- lint and typecheck pass
- simulated values are visibly labeled
- no UI claims live connectivity without evidence

## Milestone 2: local bridge skeleton

Suggested initial runtime: Node.js with TypeScript, kept in `bridge/` or a separate package.

Endpoints:

- `GET /health`
- `GET /version`
- `GET /v1/integrations`
- `GET /v1/obs/status`
- `GET /v1/events`

Live updates:

- WebSocket or Server-Sent Events

Acceptance criteria:

- UI distinguishes bridge unavailable, connecting, live, and stale
- version compatibility is visible
- bridge survives UI restart

## Milestone 3: OBS adapter

Capabilities:

- connection and authentication
- scene inventory
- source inventory
- current program scene
- source visibility
- recording state
- streaming state
- output statistics
- audio input presence

Actions:

- set current program scene
- start and stop recording
- start and stop stream with explicit confirmation

Acceptance criteria:

- state is bidirectional
- actions are confirmed by returned OBS state
- reconnect does not duplicate commands
- stale state is visible

## Milestone 4: stream builder

Wizard steps:

1. Choose stream profile.
2. Choose destination.
3. Verify OBS.
4. Select camera and audio sources.
5. Add Resolume or Kinect visuals when available.
6. Select template.
7. Run preflight.
8. Record a local test.
9. Review test results.
10. Go live.

## Milestone 5: Resolume adapter

Read:

- connection
- composition
- deck
- layers
- clips
- output readiness

Bounded actions:

- select approved clip
- set approved layer state
- load expected composition where supported

## Milestone 6: Kinect pipeline adapter

Read:

- Processing process heartbeat
- Kinect connection
- tracking count
- current mode
- frame heartbeat
- Spout source availability

Actions:

- select approved visual mode
- restart guidance first; process restart only after authorization design

## Milestone 7: secure streaming credentials

- use OBS or local operating-system secure storage
- never render stream keys after initial entry
- never store raw keys in Base44 entities
- redact diagnostics

## Milestone 8: Android companion

Only begin after Milestones 2–4 work.

Recommended form:

- native Android or Capacitor client consuming the local bridge API
- discovery and pairing
- program preview thumbnail where feasible
- stream health
- scene switching
- record and stream actions with confirmation
- no direct Spout, Kinect, Resolume, or audio-device implementation on Android
