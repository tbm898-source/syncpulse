export type ConnectionState =
  | "unavailable"
  | "connecting"
  | "connected"
  | "stale"
  | "error";

export type IntegrationKind = "obs" | "resolume" | "kinect" | "midi" | "osc";

export interface BridgeHealth {
  ok: boolean;
  uptimeMs: number;
  startedAt: string;
  obs: {
    state: ConnectionState;
    lastSeenAt: string | null;
    stale: boolean;
    error: string | null;
  };
}

export interface BridgeVersion {
  bridge: string;
  api: "v1";
  obsWebsocketProtocol: 5;
  node: string;
}

export interface IntegrationSummary {
  id: IntegrationKind;
  label: string;
  state: ConnectionState;
  lastSeenAt: string | null;
  stale: boolean;
  error: string | null;
  details?: Record<string, unknown>;
}

export interface ObsSceneSummary {
  name: string;
  index: number;
}

export interface ObsSourceSummary {
  name: string;
  kind: string;
  muted: boolean | null;
}

export interface ObsOutputStats {
  cpuUsagePercent: number;
  memoryUsageMb: number;
  activeFps: number;
  averageFrameRenderTimeMs: number;
  renderSkippedFrames: number;
  renderTotalFrames: number;
  outputSkippedFrames: number;
  outputTotalFrames: number;
}

export interface ObsStatus {
  state: ConnectionState;
  stale: boolean;
  lastSeenAt: string | null;
  error: string | null;
  host: string;
  port: number;
  version: string | null;
  streaming: boolean;
  recording: boolean;
  currentProgramScene: string | null;
  scenes: ObsSceneSummary[];
  sources: ObsSourceSummary[];
  stats: ObsOutputStats | null;
  stream: {
    bytesPerSecond: number;
    congestion: number;
    totalFrames: number;
    droppedFrames: number;
  } | null;
}

export interface BridgeEvent {
  id: string;
  type: string;
  at: string;
  payload: Record<string, unknown>;
}
