"use client";
import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function CountUp({ value, prefix = "", decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const reduced = usePrefersReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, value, { duration: 0.8, ease: "easeOut", onUpdate: setAnimated });
    return () => controls.stop();
  }, [value, reduced]);

  const shown = reduced ? value : animated;
  return <span>{prefix}{shown.toFixed(decimals)}</span>;
}
