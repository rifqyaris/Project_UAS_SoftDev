"use client";

import { useEffect } from "react";

export default function BootstrapInitializer() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js" as any);
  }, []);

  return null;
}