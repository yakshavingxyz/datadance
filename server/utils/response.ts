import { isValidEmail } from "./data_validation.ts";
import KvSingleton from "./kv_instance.ts";

export function jsonResponse(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(error: unknown, status: number = 500) {
  const message = error instanceof Error ? error.message : String(error);
  return jsonResponse({ error: message }, status);
}

export function textResponse(data: string, contentType: string, status: number = 200) {
  return new Response(data, {
    status,
    headers: { "Content-Type": contentType },
  });
}

export async function withKv<T>(
  handler: (kv: Deno.Kv) => Promise<Response>
): Promise<Response> {
  try {
    const kv = await KvSingleton.getInstance();
    return await handler(kv);
  } catch (error) {
    return errorResponse(error);
  }
}

export function requireEmail(body: Record<string, unknown>): string | null {
  const email = body.emailId as string | undefined;
  if (!email || !isValidEmail(email)) {
    return null;
  }
  return email;
}
