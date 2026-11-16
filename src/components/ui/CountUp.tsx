"use client";
import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function CountUp({ value, prefix = "", decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, { duration: 0.8, ease: "easeOut", onUpdate: setShown });
    return () => controls.stop();
  }, [value, reduced]);

  return <span>{prefix}{shown.toFixed(decimals)}</span>;
}
