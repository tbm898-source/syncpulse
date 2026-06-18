const DEFAULT_BRIDGE_BASE =
  import.meta.env.VITE_BRIDGE_BASE_URL?.replace(/\/$/, "") ||
  (import.meta.env.VITE_BRIDGE_PROXY_PREFIX
    ? import.meta.env.VITE_BRIDGE_PROXY_PREFIX.replace(/\/$/, "")
    : "http://127.0.0.1:9284");

async function bridgeFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = import.meta.env.VITE_BRIDGE_API_TOKEN;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${DEFAULT_BRIDGE_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Bridge request failed (${response.status})`);
  }

  return response.json();
}

export function getBridgeBaseUrl() {
  return DEFAULT_BRIDGE_BASE;
}

export async function fetchBridgeHealth() {
  return bridgeFetch("/health");
}

export async function fetchBridgeVersion() {
  return bridgeFetch("/version");
}

export async function fetchIntegrations() {
  return bridgeFetch("/v1/integrations");
}

export async function fetchObsStatus() {
  return bridgeFetch("/v1/obs/status");
}

export function bridgeStateLabel(state) {
  switch (state) {
    case "connected":
      return "Live";
    case "connecting":
      return "Connecting";
    case "stale":
      return "Stale";
    case "error":
      return "Error";
    default:
      return "Unavailable";
  }
}
