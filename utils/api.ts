const LOCAL_API_URL = "http://localhost:5000/api";
const PRODUCTION_API_URL = "/api";

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  // Em produção, nunca permitir fallback silencioso a localhost
  if (
    import.meta.env.PROD &&
    configuredUrl &&
    (configuredUrl.includes("localhost") || configuredUrl.includes("127.0.0.1"))
  ) {
    return PRODUCTION_API_URL;
  }

  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalhost && !import.meta.env.PROD) {
      return LOCAL_API_URL;
    }

    return PRODUCTION_API_URL;
  }

  return import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
};
