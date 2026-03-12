import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * OSC Bridge — sends an OSC message to a local/network OSC server via UDP.
 * Also proxies REST commands to the Resolume Web API for parameter-mapped actions.
 *
 * Payload: { host, port, address, value, resolume_port? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { host = "localhost", port = 8000, address, value, resolume_port = 8080 } = await req.json();

    if (!address) return Response.json({ error: "address is required" }, { status: 400 });

    // --- Resolume Web API proxy (REST) ---
    // If address maps to a known Resolume REST endpoint, use the HTTP API directly.
    const resolumeBase = `http://${host}:${resolume_port}/api/v1`;

    if (address.startsWith("/composition/")) {
      const resolumeEndpoint = address; // strip leading slash for URL build
      const isConnect = address.endsWith("/connect");
      const method = isConnect ? "POST" : "PUT";
      const body = isConnect ? null : JSON.stringify({ value: Number(value) });

      const resRes = await fetch(`${resolumeBase}${resolumeEndpoint}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body,
      });

      return Response.json({
        ok: resRes.ok,
        mode: "resolume_rest",
        address,
        status: resRes.status,
      });
    }

    // --- Generic OSC UDP send via raw socket ---
    // Encode a minimal OSC message and send via UDP.
    const oscBuffer = encodeOscMessage(address, [value]);

    const conn = Deno.listenDatagram({ port: 0, transport: "udp", hostname: "0.0.0.0" });
    const addr = { transport: "udp", hostname: host, port: Number(port) };
    await conn.send(oscBuffer, addr);
    conn.close();

    return Response.json({ ok: true, mode: "osc_udp", address, value });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
});

// Minimal OSC message encoder (address + single float32 arg)
function encodeOscMessage(address, args = []) {
  const padTo4 = (n) => Math.ceil(n / 4) * 4;

  // Address string
  const addrBytes = new TextEncoder().encode(address + "\0");
  const addrPadded = padTo4(addrBytes.length);

  // Type tag string: ",f" for a single float
  const typeStr = ",f\0\0";
  const typeBytes = new TextEncoder().encode(typeStr);

  // Float32 argument
  const argBuf = new ArrayBuffer(4);
  new DataView(argBuf).setFloat32(0, Number(args[0] ?? 0), false); // big-endian

  const totalSize = addrPadded + typeBytes.length + 4;
  const buffer = new Uint8Array(totalSize);

  buffer.set(addrBytes, 0);
  buffer.set(typeBytes, addrPadded);
  buffer.set(new Uint8Array(argBuf), addrPadded + typeBytes.length);

  return buffer;
}