const FALLBACK_API_PATH = "/api";

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (typeof window !== "undefined") {
    if (
      configuredUrl &&
      configuredUrl.includes("api.elilonlopesadvogados.com.br")
    ) {
      return `${window.location.origin}${FALLBACK_API_PATH}`;
    }

    if (configuredUrl && configuredUrl.trim()) {
      return configuredUrl.replace(/\/$/, "");
    }

    return `${window.location.origin}${FALLBACK_API_PATH}`;
  }

  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl.replace(/\/$/, "");
  }

  return FALLBACK_API_PATH;
};
