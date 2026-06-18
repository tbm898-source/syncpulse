import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import type { BridgeConfig } from "./config.js";
import type { EventBus } from "./eventBus.js";
import type { ObsAdapter } from "./integrations/obs/ObsAdapter.js";
import type { BridgeEvent, BridgeHealth, BridgeVersion, IntegrationSummary } from "./types.js";

const BRIDGE_VERSION = "0.1.0";

export function createApp(
  config: BridgeConfig,
  startedAt: number,
  obs: ObsAdapter,
  events: EventBus
): Hono {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return "*";
        return config.corsOrigins.includes(origin) ? origin : "";
      }
    })
  );

  app.use("*", async (c, next) => {
    const token = config.BRIDGE_API_TOKEN;
    if (token) {
      const header = c.req.header("authorization");
      if (header !== `Bearer ${token}`) {
        return c.json({ error: "Unauthorized" }, 401);
      }
    }
    return next();
  });

  app.get("/health", (c) => {
    const obsState = obs.getConnectionState();
    const body: BridgeHealth = {
      ok: true,
      uptimeMs: Date.now() - startedAt,
      startedAt: new Date(startedAt).toISOString(),
      obs: {
        state: obsState,
        lastSeenAt: obs.getStatus().lastSeenAt,
        stale: obs.isStale(),
        error: obs.getStatus().error
      }
    };
    return c.json(body);
  });

  app.get("/version", (c) => {
    const body: BridgeVersion = {
      bridge: BRIDGE_VERSION,
      api: "v1",
      obsWebsocketProtocol: 5,
      node: process.version
    };
    return c.json(body);
  });

  app.get("/v1/integrations", (c) => {
    const obsStatus = obs.getStatus();
    const integrations: IntegrationSummary[] = [
      {
        id: "obs",
        label: "OBS Studio",
        state: obsStatus.state,
        lastSeenAt: obsStatus.lastSeenAt,
        stale: obsStatus.stale,
        error: obsStatus.error,
        details: {
          host: obsStatus.host,
          port: obsStatus.port,
          version: obsStatus.version,
          streaming: obsStatus.streaming,
          recording: obsStatus.recording
        }
      },
      {
        id: "resolume",
        label: "Resolume Arena",
        state: "unavailable",
        lastSeenAt: null,
        stale: false,
        error: null,
        details: { note: "Adapter not implemented yet" }
      },
      {
        id: "kinect",
        label: "Kinect / PrismBurst pipeline",
        state: "unavailable",
        lastSeenAt: null,
        stale: false,
        error: null,
        details: { note: "Adapter not implemented yet" }
      }
    ];
    return c.json({ integrations });
  });

  app.get("/v1/obs/status", (c) => c.json(obs.getStatus()));

  app.post("/v1/obs/scene", async (c) => {
    const body = await c.req.json<{ sceneName?: string }>();
    if (!body.sceneName) return c.json({ error: "sceneName is required" }, 400);
    await obs.setProgramScene(body.sceneName);
    return c.json(obs.getStatus());
  });

  app.post("/v1/obs/stream/start", async (c) => {
    await obs.startStream();
    return c.json(obs.getStatus());
  });

  app.post("/v1/obs/stream/stop", async (c) => {
    await obs.stopStream();
    return c.json(obs.getStatus());
  });

  app.post("/v1/obs/record/start", async (c) => {
    await obs.startRecording();
    return c.json(obs.getStatus());
  });

  app.post("/v1/obs/record/stop", async (c) => {
    await obs.stopRecording();
    return c.json(obs.getStatus());
  });

  app.get("/v1/events", (c) => {
    const signal = c.req.raw.signal;
    return streamSSE(c, async (stream) => {
      const send = events.emit("bridge.client.connected", {
        client: c.req.header("user-agent") ?? "unknown"
      });
      await stream.writeSSE({ data: JSON.stringify(send) });

      const unsubscribe = events.subscribe((event: BridgeEvent) => {
        void stream.writeSSE({ data: JSON.stringify(event) });
      });

      const keepAlive = setInterval(() => {
        void stream.writeSSE({
          event: "ping",
          data: JSON.stringify({ at: new Date().toISOString() })
        });
      }, 15_000);

      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };

      if (signal.aborted) {
        cleanup();
        return;
      }

      signal.addEventListener("abort", cleanup, { once: true });

      while (!signal.aborted) {
        await stream.sleep(60_000);
      }

      cleanup();
    });
  });

  return app;
}
