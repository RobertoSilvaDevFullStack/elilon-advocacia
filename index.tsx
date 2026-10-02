import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

/** Fontes self-hosted após first paint — não bloqueiam render/LCP */
const loadFonts = () => import("./styles/fonts.css");
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => loadFonts(), { timeout: 2000 });
} else {
  setTimeout(loadFonts, 1);
}

/** Remove shell estático do hero após React montar */
const staticHero = document.getElementById("static-hero");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

staticHero?.remove();
