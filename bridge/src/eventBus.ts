import { randomUUID } from "node:crypto";
import type { BridgeEvent } from "./types.js";

type Listener = (event: BridgeEvent) => void;

export class EventBus {
  private readonly listeners = new Set<Listener>();

  emit(type: string, payload: Record<string, unknown> = {}): BridgeEvent {
    const event: BridgeEvent = {
      id: randomUUID(),
      type,
      at: new Date().toISOString(),
      payload
    };
    for (const listener of this.listeners) {
      listener(event);
    }
    return event;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
