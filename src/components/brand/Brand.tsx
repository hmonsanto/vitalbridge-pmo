/** VitalBridgeRX logo mark: a rounded square with a serif "V" (burgundy on light, cream on the rail). */
export function BrandMark({ size = 36, inverse = false }: { size?: number; inverse?: boolean }) {
  return (
    <span
      aria-hidden
      className={`font-display grid shrink-0 place-items-center font-bold ${
        inverse ? "bg-[#f1ece1] text-[#6b1f2a]" : "bg-[#6b1f2a] text-white"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.58, borderRadius: size * 0.27 }}
    >
      V
    </span>
  );
}

/** "VitalBridge" in serif with the gold "RX", as on the company site. */
export function BrandWordmark({ inverse = false, className = "" }: { inverse?: boolean; className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span className={inverse ? "text-[#f1ece1]" : "text-[var(--brand-burgundy)]"}>VitalBridge</span>
      <span className="text-[#c99a4a]">RX</span>
    </span>
  );
}
