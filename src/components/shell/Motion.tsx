"use client";
import { MotionConfig } from "framer-motion";

/** Every animation below this point honors the user's reduced-motion preference. */
export function Motion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
