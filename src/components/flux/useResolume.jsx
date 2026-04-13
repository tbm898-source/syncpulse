import { useState, useEffect, useCallback, useRef } from "react";
import { getResolumeApiBase } from "@/lib/resolumeApi";

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 8080; // Resolume Web Remote HTTP API (not OSC — that is usually UDP ~7000)

/**
 * Hook that polls the Resolume Arena Web API and exposes composition state + actions.
 * Base URL from getResolumeApiBase (supports VITE_RESOLUME_PROXY_PREFIX for dev/CORS).
 */
export function useResolume(host = DEFAULT_HOST, port = DEFAULT_PORT, pollMs = 2000) {
  const [composition, setComposition] = useState(null);
  const [layers, setLayers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const base = getResolumeApiBase(host, port);

  const fetchComposition = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${base}/composition`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setComposition(data);
    setConnected(true);
    setError(null);

    // Extract layers with their clips
    const layerList = (data.layers || []).map((layer, li) => ({
      id: layer.id ?? li,
      name: layer.name?.value ?? `Layer ${li + 1}`,
      bypassed: layer.bypassed?.value ?? false,
      solo: layer.solo?.value ?? false,
      opacity: layer.video?.opacity?.value ?? 1,
      clips: (layer.clips || []).map((clip, ci) => ({
        id: clip.id ?? ci,
        name: clip.name?.value ?? (clip.connected?.value ? `Clip ${ci + 1}` : ""),
        connected: clip.connected?.value ?? false,
        playing: clip.transport?.position?.value > 0,
        thumbnail: clip.thumbnail ?? null,
      })).filter(c => c.connected),
    }));
    setLayers(layerList);
    setLoading(false);
  }, [base]);

  const poll = useCallback(async () => {
    try {
      await fetchComposition();
    } catch (e) {
      setConnected(false);
      setError(e.message);
      setLoading(false);
    }
  }, [fetchComposition]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, pollMs);
    return () => clearInterval(intervalRef.current);
  }, [poll, pollMs]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const triggerClip = useCallback(async (layerIndex, clipIndex) => {
    await fetch(`${base}/composition/layers/${layerIndex}/clips/${clipIndex}/connect`, {
      method: "POST",
    });
    poll();
  }, [base, poll]);

  const setLayerOpacity = useCallback(async (layerIndex, value) => {
    await fetch(`${base}/composition/layers/${layerIndex}/video/opacity`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  }, [base]);

  const setLayerBypass = useCallback(async (layerIndex, bypassed) => {
    await fetch(`${base}/composition/layers/${layerIndex}/bypassed`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: bypassed }),
    });
    poll();
  }, [base, poll]);

  const setColumnConnect = useCallback(async (columnIndex) => {
    await fetch(`${base}/composition/columns/${columnIndex}/connect`, {
      method: "POST",
    });
    poll();
  }, [base, poll]);

  const setCompositionBpm = useCallback(async (bpm) => {
    await fetch(`${base}/composition/tempocontroller/tempo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: bpm }),
    });
  }, [base]);

  const refreshNow = poll;

  return {
    composition,
    layers,
    connected,
    error,
    loading,
    triggerClip,
    setLayerOpacity,
    setLayerBypass,
    setColumnConnect,
    setCompositionBpm,
    refreshNow,
  };
}