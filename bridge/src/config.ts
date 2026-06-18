import { z } from "zod";

const envSchema = z.object({
  BRIDGE_HOST: z.string().default("127.0.0.1"),
  BRIDGE_PORT: z.coerce.number().int().min(1).max(65535).default(9284),
  BRIDGE_API_TOKEN: z.string().optional(),
  BRIDGE_CORS_ORIGINS: z
    .string()
    .default(
      "http://localhost:5173,https://sync-pulse-stream.base44.app,https://www.syncpulsestream.com"
    ),
  OBS_HOST: z.string().default("127.0.0.1"),
  OBS_PORT: z.coerce.number().int().min(1).max(65535).default(4455),
  OBS_PASSWORD: z.string().default(""),
  BRIDGE_STALE_MS: z.coerce.number().int().positive().default(10_000),
  OBS_RECONNECT_MS: z.coerce.number().int().positive().default(3_000)
});

export type BridgeConfig = z.infer<typeof envSchema> & {
  corsOrigins: string[];
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BridgeConfig {
  const parsed = envSchema.parse(env);
  return {
    ...parsed,
    corsOrigins: parsed.BRIDGE_CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}
