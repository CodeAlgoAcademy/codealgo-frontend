import type { Env } from "./env";

/**
 * Cloudflare Access JWT check.
 *
 * Access already stops anyone without a login at the edge, so in the normal
 * case this never rejects anything. It is here for the cases where the edge is
 * not in the way: a misconfigured Access app, a path someone excluded from the
 * policy, or a route added later on another hostname. Every admin request has
 * to carry a token signed by our team's keys for our app's audience, or it gets
 * a 403, whatever the edge did.
 *
 * https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */

export interface AccessIdentity {
   email: string;
   sub: string;
}

interface Jwk extends JsonWebKey {
   kid: string;
}

let keyCache: { team: string; at: number; keys: Map<string, CryptoKey> } | null = null;
const KEY_TTL_MS = 60 * 60 * 1000;

function b64urlToBytes(input: string): Uint8Array {
   const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
   const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
   const out = new Uint8Array(bin.length);
   for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
   return out;
}

function decodePart<T>(part: string): T {
   return JSON.parse(new TextDecoder().decode(b64urlToBytes(part))) as T;
}

async function loadKeys(team: string, force = false): Promise<Map<string, CryptoKey>> {
   if (!force && keyCache && keyCache.team === team && Date.now() - keyCache.at < KEY_TTL_MS) {
      return keyCache.keys;
   }
   const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
   if (!res.ok) throw new Error(`certs ${res.status}`);
   const body = (await res.json()) as { keys: Jwk[] };
   const keys = new Map<string, CryptoKey>();
   for (const jwk of body.keys || []) {
      const key = await crypto.subtle.importKey(
         "jwk",
         jwk,
         { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
         false,
         ["verify"],
      );
      keys.set(jwk.kid, key);
   }
   keyCache = { team, at: Date.now(), keys };
   return keys;
}

function readToken(request: Request): string {
   const header = request.headers.get("Cf-Access-Jwt-Assertion");
   if (header) return header;
   const cookie = request.headers.get("Cookie") || "";
   const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
   return match ? match[1] : "";
}

/**
 * Local dev only: wrangler dev with DEV_NO_AUTH=1 in .dev.vars. wrangler dev
 * rewrites the Host to the first route, so the hostname cannot tell us we are
 * local; the connecting address can. In production cf-connecting-ip is the
 * visitor's real address and DEV_NO_AUTH is never set, so both have to be
 * wrong at once for this to open anything.
 */
export function isLocalDev(request: Request, env: Env): boolean {
   const ip = request.headers.get("cf-connecting-ip") || "";
   return env.DEV_NO_AUTH === "1" && (ip === "127.0.0.1" || ip === "::1");
}

export async function verifyAccess(request: Request, env: Env): Promise<AccessIdentity | null> {
   if (isLocalDev(request, env)) return { email: "dev@localhost", sub: "dev" };

   const team = (env.ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
   const aud = env.ACCESS_AUD || "";
   if (!team || !aud) return null;

   const token = readToken(request);
   const parts = token.split(".");
   if (parts.length !== 3) return null;

   let header: { kid?: string; alg?: string };
   let payload: { aud?: string | string[]; exp?: number; nbf?: number; iss?: string; email?: string; sub?: string };
   try {
      header = decodePart(parts[0]);
      payload = decodePart(parts[1]);
   } catch {
      return null;
   }
   if (header.alg !== "RS256" || !header.kid) return null;

   let keys = await loadKeys(team);
   let key = keys.get(header.kid);
   if (!key) {
      // Access rotates keys. A kid we have not seen means our cache is stale,
      // not that the token is forged, so refetch once before deciding.
      keys = await loadKeys(team, true);
      key = keys.get(header.kid);
   }
   if (!key) return null;

   const ok = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      b64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
   );
   if (!ok) return null;

   const now = Math.floor(Date.now() / 1000);
   const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
   if (!auds.includes(aud)) return null;
   if (!payload.exp || payload.exp < now) return null;
   if (payload.nbf && payload.nbf > now + 60) return null;
   if (payload.iss && payload.iss !== `https://${team}`) return null;

   return { email: payload.email || payload.sub || "unknown", sub: payload.sub || "" };
}
