import type { ApiErrorPayload } from "@/types/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
  token?: string | null;
}

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload | string;

  constructor(status: number, message: string, payload?: ApiErrorPayload | string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function resolveMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      resolveMessage(payload, "Ocurrio un error al comunicarse con el servidor."),
      payload as ApiErrorPayload | string,
    );
  }

  return payload as T;
}
