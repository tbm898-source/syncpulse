# SyncPulse Product Architecture

## Product boundary

SyncPulse is a streaming workflow and coordination layer.

It is not:

- a replacement for OBS
- a replacement for Resolume
- a Kinect renderer
- a DAW or DJ application
- a lighting engine
- a general event-management platform

It coordinates existing tools and makes their combined workflow easier to configure, verify, operate, and recover.

## Core domains

### StreamProfile

Stores the reusable intent of a stream:

- name
- destination
- output resolution
- frame rate
- bitrate guidance
- OBS scene collection
- default scene
- required sources
- Resolume composition
- Kinect mode
- audio inputs
- overlays
- recording preference
- fallback scene

### Source

Normalized sources include:

- camera
- screen capture
- DJ audio
- microphone
- Resolume output
- Kinect / Processing output
- media file
- browser overlay
- chat overlay
- remote guest

Every source reports:

- source type
- provider
- availability
- observed time
- freshness
- live, simulated, stale, or unavailable state
- current scene visibility
- audio or video presence where applicable

### Scene

A scene represents the viewer-facing composition managed by OBS.

Initial templates:

- DJ plus visuals
- full-screen visuals
- camera full
- maker or workshop view
- break screen
- technical fallback
- event wide shot

### Integration

Initial integration types:

- OBS WebSocket
- Resolume Web Remote
- Resolume OSC
- Processing / Kinect heartbeat
- MIDI
- OSC
- Spout readiness
- NDI readiness
- Base44 account and profile sync

### PreflightCheck

A check has:

- id
- title
- category
- required or optional status
- current result
- evidence
- observed time
- remediation guidance

Initial checks:

- local bridge running
- OBS connected
- correct scene collection loaded
- required cameras present
- DJ audio present
- microphone present when required
- Resolume connected when required
- Kinect pipeline healthy when required
- visual source visible in OBS
- destination configured
- recording path writable
- upload-health test passed

### StreamSession

A session records:

- profile
- operator
- start and end times
- destination
- preflight result
- stream state changes
- recording state
- warnings
- reconnects
- bitrate and dropped-frame summaries
- integration failures
- operator notes

## Runtime boundary

### Browser / Base44 UI

May hold:

- account identity
- saved non-secret profile metadata
- UI preferences
- scene templates
- session summaries

Must not hold:

- unrestricted machine credentials
- raw OBS passwords in browser persistence
- stream keys in visible entity records
- direct device-control credentials

### Local bridge

Owns:

- machine-local credentials
- local application connections
- device discovery
- protocol translation
- command authorization
- state freshness
- reconnect behavior
- local logs

## Mobile boundary

Android is a companion client after the local bridge exists.

It should communicate with the bridge over the trusted local network or an explicitly configured secure relay. It should expose only bounded actions and health information appropriate to the authenticated role.
