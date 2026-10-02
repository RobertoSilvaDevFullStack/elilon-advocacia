import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getApiBaseUrl } from "./api";

describe("getApiBaseUrl", () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.unstubAllGlobals();
    (import.meta.env as any).VITE_API_URL = undefined;
    (import.meta.env as any).PROD = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    (import.meta.env as any).VITE_API_URL = originalEnv.VITE_API_URL;
    (import.meta.env as any).PROD = originalEnv.PROD;
  });

  it("should return configured VITE_API_URL with trailing slash stripped", () => {
    (import.meta.env as any).VITE_API_URL = "https://custom-api.example.com/api/";
    expect(getApiBaseUrl()).toBe("https://custom-api.example.com/api");
  });

  it("should default to /api in production when VITE_API_URL is omitted", () => {
    (import.meta.env as any).PROD = true;
    (import.meta.env as any).VITE_API_URL = "";

    vi.stubGlobal("window", {
      location: { hostname: "elilonlopesadvogados.com.br" },
    });

    expect(getApiBaseUrl()).toBe("/api");
  });

  it("should never silently fall back to localhost in production even if configuredUrl is localhost", () => {
    (import.meta.env as any).PROD = true;
    (import.meta.env as any).VITE_API_URL = "http://localhost:5000/api";

    expect(getApiBaseUrl()).toBe("/api");
  });

  it("should return localhost API URL in development when accessed from localhost", () => {
    (import.meta.env as any).PROD = false;
    (import.meta.env as any).VITE_API_URL = "";

    vi.stubGlobal("window", {
      location: { hostname: "localhost" },
    });

    expect(getApiBaseUrl()).toBe("http://localhost:5000/api");
  });

  it("should return /api on public domains when in browser without explicit VITE_API_URL", () => {
    (import.meta.env as any).PROD = false;
    (import.meta.env as any).VITE_API_URL = "";

    vi.stubGlobal("window", {
      location: { hostname: "elilonlopesadvogados.com.br" },
    });

    expect(getApiBaseUrl()).toBe("/api");
  });

  it("should return /api in non-browser production environment when VITE_API_URL is omitted", () => {
    (import.meta.env as any).PROD = true;
    (import.meta.env as any).VITE_API_URL = "";

    expect(getApiBaseUrl()).toBe("/api");
  });
});
