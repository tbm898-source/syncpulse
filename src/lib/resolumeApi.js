/**
 * Base URL for Resolume Arena Web Remote API (/api/v1/...).
 *
 * - Default: http://{host}:{port}/api/v1 (browser must be same machine or CORS allowed by Resolume).
 * - Dev / tunnel: set VITE_RESOLUME_PROXY_PREFIX=/resolume-api so Vite proxies to local Resolume (see vite.config.js).
 */
export function getResolumeApiBase(host = "localhost", port = 8080) {
  const prefix = import.meta.env.VITE_RESOLUME_PROXY_PREFIX;
  if (prefix != null && String(prefix).trim() !== "") {
    return `${String(prefix).replace(/\/$/, "")}/api/v1`;
  }
  return `http://${host}:${port}/api/v1`;
}
