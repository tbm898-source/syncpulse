import { useCallback, useEffect, useState } from "react";
import {
  bridgeStateLabel,
  fetchBridgeHealth,
  fetchObsStatus,
  getBridgeBaseUrl
} from "@/lib/bridgeApi";

const POLL_MS = 3000;

export function useBridgeStatus() {
  const [bridge, setBridge] = useState({
    available: false,
    state: "unavailable",
    label: "Unavailable",
    error: null,
    baseUrl: getBridgeBaseUrl()
  });
  const [obs, setObs] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [health, obsStatus] = await Promise.all([
        fetchBridgeHealth(),
        fetchObsStatus()
      ]);
      const state = health?.obs?.state ?? "unavailable";
      setBridge({
        available: true,
        state,
        label: bridgeStateLabel(state),
        error: health?.obs?.error ?? null,
        stale: Boolean(health?.obs?.stale),
        uptimeMs: health?.uptimeMs ?? 0,
        baseUrl: getBridgeBaseUrl()
      });
      setObs(obsStatus);
    } catch (error) {
      setBridge({
        available: false,
        state: "unavailable",
        label: "Unavailable",
        error: error instanceof Error ? error.message : "Bridge unreachable",
        baseUrl: getBridgeBaseUrl()
      });
      setObs(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  return { bridge, obs, refresh };
}
