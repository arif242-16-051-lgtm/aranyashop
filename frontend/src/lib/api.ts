/**
 * API helpers for AranyaShop.
 *
 * Always use relative paths like "/api/admin/categories".
 * Next.js dev rewrites proxy them to http://localhost:8080.
 * In production, Nginx routes /api/* directly to Spring Boot.
 */

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);

  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { /* ignore */ }
    const suffix = detail ? ": " + detail : "";
    throw new Error("API error " + res.status + " " + res.statusText + suffix);
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function getJson<T = unknown>(path: string): Promise<T> {
  return request<T>(path);
}

export function postJson<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function putJson<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function deleteJson<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
