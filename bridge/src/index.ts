import { serve } from "@hono/node-server";
import { loadConfig } from "./config.js";
import { EventBus } from "./eventBus.js";
import { ObsAdapter } from "./integrations/obs/ObsAdapter.js";
import { createApp } from "./server.js";

const config = loadConfig();
const startedAt = Date.now();
const events = new EventBus();
const obs = new ObsAdapter(config, events);
const app = createApp(config, startedAt, obs, events);

await obs.start();

const server = serve(
  {
    fetch: app.fetch,
    hostname: config.BRIDGE_HOST,
    port: config.BRIDGE_PORT
  },
  (info) => {
    console.log(
      `SyncPulse local bridge listening on http://${info.address}:${info.port}`
    );
  }
);

async function shutdown(): Promise<void> {
  await obs.stop();
  server.close();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
