export function sseEncode(event: unknown): Uint8Array {
  const line = `data: ${JSON.stringify(event)}\n\n`;
  return new TextEncoder().encode(line);
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};
