import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const PIXEL_ID = "2447345122366584";

/** Meta Pixel — só após primeira interação (scroll/click) para não penalizar TBT/LCP. */
const MetaPixel: React.FC = () => {
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const boot = () => {
      if (window.fbq) {
        setReady(true);
        return;
      }
      (function (f: Window, b: Document, e: string, v: string) {
        if (f.fbq) return;
        const n: any = function (...args: unknown[]) {
          n.callMethod ? n.callMethod(...args) : n.queue.push(args);
        };
        f.fbq = n;
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        const t = b.createElement(e) as HTMLScriptElement;
        t.async = true;
        t.src = v;
        const s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq!("init", PIXEL_ID);
      window.fbq!("track", "PageView");
      setReady(true);
    };

    const onInteract = () => {
      boot();
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("pointerdown", onInteract);
    };

    window.addEventListener("scroll", onInteract, { passive: true });
    window.addEventListener("pointerdown", onInteract, { passive: true });

    const fallback = window.setTimeout(onInteract, 12000);

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("pointerdown", onInteract);
    };
  }, []);

  useEffect(() => {
    if (ready && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname, ready]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
};

export default MetaPixel;
