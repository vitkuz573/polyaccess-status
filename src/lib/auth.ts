import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import { StatusPageRole } from "@prisma/client";

const ACCESS_COOKIE = "pa_status_session";

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
  maxAge?: number;
};

export function getCookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production" && env.SECURE_COOKIES !== "false",
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: StatusPageRole;
  organizationId: string;
};

export async function createAdminToken(payload: AdminTokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
  return new SignJWT({ ...payload, type: "status_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "status_admin") return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: payload.role as StatusPageRole,
      organizationId: String(payload.organizationId),
    };
  } catch {
    return null;
  }
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, token, getCookieOptions(8 * 60 * 60));
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...getCookieOptions(), maxAge: 0 });
}

export async function getAdminToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const token = await getAdminToken();
  if (!token) return null;
  return verifyAdminToken(token);
}
