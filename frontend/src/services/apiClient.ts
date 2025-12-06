export type BenchmarkPayload = Record<string, unknown>;

const API_BASE = "/api";

export async function postBenchmark(path: string, payload: BenchmarkPayload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}
