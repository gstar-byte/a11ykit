"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        }, { timeout: 4000 });
      } else {
        setTimeout(() => {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        }, 2000);
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW, { once: true });
    }
  }, []);

  return null;
}

