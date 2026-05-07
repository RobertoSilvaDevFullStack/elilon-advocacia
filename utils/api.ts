const LOCAL_API_URL = "http://localhost:5000/api";
const PRODUCTION_API_URL = "https://api.elilonlopesadvogados.com.br/api";

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return LOCAL_API_URL;
    }

    return PRODUCTION_API_URL;
  }

  return PRODUCTION_API_URL;
};
