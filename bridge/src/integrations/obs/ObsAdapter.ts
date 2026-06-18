import OBSWebSocket from "obs-websocket-js";
import type { BridgeConfig } from "../../config.js";
import type { EventBus } from "../../eventBus.js";
import type {
  ConnectionState,
  ObsOutputStats,
  ObsSceneSummary,
  ObsSourceSummary,
  ObsStatus
} from "../../types.js";

interface ObsRuntimeState {
  state: ConnectionState;
  lastSeenAt: string | null;
  error: string | null;
  version: string | null;
  streaming: boolean;
  recording: boolean;
  currentProgramScene: string | null;
  scenes: ObsSceneSummary[];
  sources: ObsSourceSummary[];
  stats: ObsOutputStats | null;
  stream: ObsStatus["stream"];
}

const EMPTY_RUNTIME: ObsRuntimeState = {
  state: "unavailable",
  lastSeenAt: null,
  error: null,
  version: null,
  streaming: false,
  recording: false,
  currentProgramScene: null,
  scenes: [],
  sources: [],
  stats: null,
  stream: null
};

export class ObsAdapter {
  private readonly client = new OBSWebSocket();
  private runtime: ObsRuntimeState = { ...EMPTY_RUNTIME };
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private started = false;

  constructor(
    private readonly config: BridgeConfig,
    private readonly events: EventBus
  ) {}

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    this.client.on("ConnectionOpened", () => {
      this.events.emit("obs.connected");
      void this.refresh();
    });
    this.client.on("ConnectionClosed", () => {
      this.setDisconnected("OBS WebSocket connection closed");
      this.scheduleReconnect();
    });
    this.client.on("ConnectionError", (error) => {
      this.setDisconnected(error?.message ?? "OBS WebSocket connection error");
      this.scheduleReconnect();
    });
    this.client.on("StreamStateChanged", () => void this.refresh());
    this.client.on("RecordStateChanged", () => void this.refresh());
    this.client.on("CurrentProgramSceneChanged", () => void this.refresh());
    await this.connect();
    this.pollTimer = setInterval(() => void this.refresh(), 2_000);
  }

  async stop(): Promise<void> {
    this.started = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    await this.client.disconnect().catch(() => undefined);
    this.runtime = { ...EMPTY_RUNTIME };
  }

  getConnectionState(now = Date.now()): ConnectionState {
    if (this.runtime.state === "connected" && this.runtime.lastSeenAt) {
      const age = now - Date.parse(this.runtime.lastSeenAt);
      if (age > this.config.BRIDGE_STALE_MS) return "stale";
    }
    return this.runtime.state;
  }

  isStale(now = Date.now()): boolean {
    return this.getConnectionState(now) === "stale";
  }

  getStatus(now = Date.now()): ObsStatus {
    const state = this.getConnectionState(now);
    return {
      state,
      stale: state === "stale",
      lastSeenAt: this.runtime.lastSeenAt,
      error: this.runtime.error,
      host: this.config.OBS_HOST,
      port: this.config.OBS_PORT,
      version: this.runtime.version,
      streaming: this.runtime.streaming,
      recording: this.runtime.recording,
      currentProgramScene: this.runtime.currentProgramScene,
      scenes: this.runtime.scenes,
      sources: this.runtime.sources,
      stats: this.runtime.stats,
      stream: this.runtime.stream
    };
  }

  async setProgramScene(sceneName: string): Promise<void> {
    this.assertConnected();
    await this.client.call("SetCurrentProgramScene", { sceneName });
    await this.refresh();
    this.events.emit("obs.scene.changed", { sceneName });
  }

  async startStream(): Promise<void> {
    this.assertConnected();
    await this.client.call("StartStream");
    await this.refresh();
    this.events.emit("obs.stream.started");
  }

  async stopStream(): Promise<void> {
    this.assertConnected();
    await this.client.call("StopStream");
    await this.refresh();
    this.events.emit("obs.stream.stopped");
  }

  async startRecording(): Promise<void> {
    this.assertConnected();
    await this.client.call("StartRecord");
    await this.refresh();
    this.events.emit("obs.record.started");
  }

  async stopRecording(): Promise<void> {
    this.assertConnected();
    await this.client.call("StopRecord");
    await this.refresh();
    this.events.emit("obs.record.stopped");
  }

  private assertConnected(): void {
    if (this.getConnectionState() !== "connected") {
      throw new Error("OBS is not connected");
    }
  }

  private async connect(): Promise<void> {
    if (!this.started) return;
    this.runtime = {
      ...this.runtime,
      state: "connecting",
      error: null
    };
    this.events.emit("obs.connecting");

    const url = `ws://${this.config.OBS_HOST}:${this.config.OBS_PORT}`;
    try {
      await this.client.connect(url, this.config.OBS_PASSWORD || undefined);
      await this.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "OBS connect failed";
      this.setDisconnected(message);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.started || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, this.config.OBS_RECONNECT_MS);
  }

  private setDisconnected(message: string): void {
    this.runtime = {
      ...EMPTY_RUNTIME,
      state: "error",
      error: message
    };
    this.events.emit("obs.disconnected", { message });
  }

  private async refresh(): Promise<void> {
    if (!this.client.identified) return;

    try {
      const [version, sceneList, programScene, streamStatus, recordStatus, stats, inputs] =
        await Promise.all([
          this.client.call("GetVersion"),
          this.client.call("GetSceneList"),
          this.client.call("GetCurrentProgramScene"),
          this.client.call("GetStreamStatus"),
          this.client.call("GetRecordStatus"),
          this.client.call("GetStats"),
          this.client.call("GetInputList")
        ]);

      const scenes: ObsSceneSummary[] = sceneList.scenes.map((scene, index) => ({
        name: scene.sceneName as string,
        index
      }));

      const sources: ObsSourceSummary[] = await Promise.all(
        inputs.inputs.slice(0, 50).map(async (input) => {
          const name = input.inputName as string;
          const kind = input.inputKind as string;
          let muted: boolean | null = null;
          try {
            const volume = await this.client.call("GetInputMute", { inputName: name });
            muted = Boolean(volume.inputMuted);
          } catch {
            muted = null;
          }
          return { name, kind, muted };
        })
      );

      const outputStats: ObsOutputStats = {
        cpuUsagePercent: stats.cpuUsage,
        memoryUsageMb: Math.round(stats.memoryUsage / (1024 * 1024)),
        activeFps: stats.activeFps,
        averageFrameRenderTimeMs: stats.averageFrameRenderTime,
        renderSkippedFrames: stats.renderSkippedFrames,
        renderTotalFrames: stats.renderTotalFrames,
        outputSkippedFrames: stats.outputSkippedFrames,
        outputTotalFrames: stats.outputTotalFrames
      };

      this.runtime = {
        state: "connected",
        lastSeenAt: new Date().toISOString(),
        error: null,
        version: `${version.obsVersion} (ws ${version.obsWebSocketVersion})`,
        streaming: streamStatus.outputActive,
        recording: recordStatus.outputActive,
        currentProgramScene: programScene.currentProgramSceneName as string,
        scenes,
        sources,
        stats: outputStats,
        stream: {
          bytesPerSecond: streamStatus.outputBytes,
          congestion: streamStatus.outputCongestion,
          totalFrames: streamStatus.outputTotalFrames,
          droppedFrames: streamStatus.outputSkippedFrames
        }
      };

      this.events.emit("obs.status", {
        streaming: this.runtime.streaming,
        recording: this.runtime.recording,
        scene: this.runtime.currentProgramScene
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "OBS refresh failed";
      this.setDisconnected(message);
      this.scheduleReconnect();
    }
  }
}
