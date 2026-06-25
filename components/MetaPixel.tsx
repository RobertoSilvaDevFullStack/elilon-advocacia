import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Typings for fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const PIXEL_ID = "2447345122366584";

const MetaPixel: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const initPixel = () => {
      if (window.fbq) return;
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        "script",
        "https://connect.facebook.net/en_US/fbevents.js",
      );
      window.fbq("init", PIXEL_ID);
      window.fbq("track", "PageView");
    };

    // Adia pixel de terceiros até após idle — melhora TBT e Best Practices
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(initPixel, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(initPixel, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Track PageView on route change
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt="Meta Pixel"
      />
    </noscript>
  );
};

export default MetaPixel;
