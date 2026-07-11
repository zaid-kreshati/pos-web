import { NFC_BRIDGE_URL } from '../utils/constants';

// Client for the local NFC bridge running on the POS device.
// This does NOT go through the VPS API client - it talks to 127.0.0.1.

export interface BridgeHealth {
  ok: boolean;
  reader: boolean;
  reader_name: string | null;
}

export interface BridgeWriteResult {
  ok: boolean;
  url?: string;
  uid?: string;
  error?: 'no_reader' | 'no_tag' | 'write_failed' | 'empty_url' | 'exception' | string;
  message?: string;
}

// The bridge write waits up to ~15s for a tag, so give fetch some headroom.
const WRITE_TIMEOUT_MS = 20000;
const HEALTH_TIMEOUT_MS = 3000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const checkBridgeHealth = async (): Promise<BridgeHealth> => {
  try {
    const res = await fetchWithTimeout(
      `${NFC_BRIDGE_URL}/health`,
      { method: 'GET' },
      HEALTH_TIMEOUT_MS,
    );
    if (!res.ok) return { ok: false, reader: false, reader_name: null };
    return (await res.json()) as BridgeHealth;
  } catch {
    // Bridge not running / unreachable.
    return { ok: false, reader: false, reader_name: null };
  }
};

export const writeToTag = async (url: string): Promise<BridgeWriteResult> => {
  try {
    const res = await fetchWithTimeout(
      `${NFC_BRIDGE_URL}/write`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      },
      WRITE_TIMEOUT_MS,
    );
    if (!res.ok) {
      return { ok: false, error: 'bridge_error', message: `Bridge returned ${res.status}` };
    }
    return (await res.json()) as BridgeWriteResult;
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    return {
      ok: false,
      error: aborted ? 'timeout' : 'unreachable',
      message: aborted
        ? 'NFC bridge timed out waiting for a tag'
        : 'Cannot reach the NFC bridge. Is start_bridge running on this PC?',
    };
  }
};
