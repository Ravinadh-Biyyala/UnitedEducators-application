import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Shared design tokens (aligned with Dashboard) ───────────────────────────
export const N    = "#0123D4";
export const G    = "#C9A227";
export const BD   = "#C4CDD8";
export const BDL  = "#DCE3EC";
export const TD   = "#1A2530";
export const TM   = "#4A5D6E";
export const TT   = "#7A8FA3";
export const OK   = "#15803D";
export const WARN = "#B45309";
export const BAD  = "#B91C1C";
export const font = "'Source Sans 3', system-ui, sans-serif";

// ─── KPITile (Dashboard-style, with minimal hover fill) ─────────────────────
export interface KPI {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "none";
  accent: string;
  icon: React.ReactNode;
}

export function KPITile({ k, compact = false }: { k: KPI; compact?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const TrendArrow = k.trend === "down" ? TrendingDown : TrendingUp;
  const trendColor = k.trend === "none" ? TT : OK;

  const padding    = compact ? "10px 12px" : "14px 16px";
  const iconBox    = compact ? 24 : 30;
  const iconRadius = compact ? 6 : 8;
  const labelSize  = compact ? "0.56rem" : "0.6rem";
  const valueSize  = compact ? "1.25rem" : "1.7rem";
  const valueMt    = compact ? 4 : 6;
  const subSize    = compact ? "0.62rem" : "0.66rem";
  const subMt      = compact ? "mt-1" : "mt-2";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`${k.label}: ${k.value}, ${k.sub}`}
      style={{
        background: hovered
          ? `linear-gradient(135deg, white 0%, ${k.accent}08 100%)`
          : "white",
        border: `1px solid ${hovered ? `${k.accent}40` : BDL}`,
        borderRadius: 10,
        padding,
        boxShadow: hovered
          ? `0 2px 6px ${k.accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative", overflow: "hidden",
        outline: "none", cursor: "default",
      }}>
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: hovered ? 4 : 3,
        background: hovered ? k.accent : `linear-gradient(90deg, ${k.accent}, ${k.accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize: labelSize, fontWeight: 700, color: TT,
          textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
        }}>
          {k.label}
        </p>
        <span className="inline-flex items-center justify-center"
          style={{
            width: iconBox, height: iconBox, borderRadius: iconRadius,
            background: hovered ? `${k.accent}1F` : `${k.accent}10`,
            color: k.accent,
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}>
          {k.icon}
        </span>
      </div>
      <p style={{
        fontSize: valueSize, fontWeight: 800,
        color: hovered ? k.accent : TD,
        lineHeight: 1.1, marginTop: valueMt,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>
        {k.value}
      </p>
      <div className={`inline-flex items-center gap-1 ${subMt}`}
        style={{ fontSize: subSize, color: trendColor, fontWeight: 600 }}>
        {k.trend !== "none" && <TrendArrow size={compact ? 10 : 11}/>}
        <span>{k.sub}</span>
      </div>
    </div>
  );
}

// ─── SectionCard (Dashboard-style card chrome) ──────────────────────────────
export function SectionCard({
  title, icon, accent = N, action, children, noPad = false,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    }}>
      <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
        style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="inline-flex items-center justify-center"
              style={{ width: 24, height: 24, borderRadius: 6, background: `${accent}12`, color: accent }}>
              {icon}
            </span>
          )}
          <h3 style={{
            fontSize: "0.74rem", fontWeight: 700, color: TD,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {title}
          </h3>
        </div>
        {action}
      </div>
      {noPad ? children : <div className="p-5">{children}</div>}
    </div>
  );
}

// ─── Ripple sub-component (Material-style click ripple) ─────────────────────
function Ripple({ x, y, color, onDone }: {
  x: number; y: number; color: string; onDone: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExpanded(true), 10);
    const t2 = setTimeout(() => onDone(), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <span aria-hidden style={{
      position: "absolute",
      top: y, left: x,
      width: expanded ? 300 : 0,
      height: expanded ? 300 : 0,
      opacity: expanded ? 0 : 0.4,
      background: color,
      borderRadius: "50%",
      transform: "translate(-50%, -50%)",
      transition: "width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out",
      pointerEvents: "none",
    }}/>
  );
}

// ─── RippleButton (foundation — used by PrimaryButton, GhostButton, etc.) ───
export function RippleButton({
  onClick, children, className = "",
  bg, bgHover, color, border, rippleColor,
  shadow, shadowHover, padding = "8px 14px",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  bg: string;
  bgHover: string;
  color: string;
  border?: string;
  rippleColor: string;
  shadow?: string;
  shadowHover?: string;
  padding?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    onClick?.();
  };

  const removeRipple = (id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        background: hovered ? bgHover : bg,
        color,
        border: border ?? "none",
        borderRadius: 6,
        padding,
        fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
        boxShadow: hovered ? (shadowHover ?? shadow ?? "none") : (shadow ?? "none"),
        transition: "background 0.6s ease, box-shadow 0.2s ease",
        userSelect: "none",
      }}>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {children}
      </span>
      {ripples.map(r => (
        <Ripple key={r.id} x={r.x} y={r.y} color={rippleColor} onDone={() => removeRipple(r.id)}/>
      ))}
    </button>
  );
}

// ─── PrimaryButton (solid brand-blue + ripple) ──────────────────────────────
export function PrimaryButton({
  onClick, children, className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RippleButton
      onClick={onClick}
      className={className}
      bg={N}
      bgHover="#011AA8"
      color="white"
      rippleColor="rgba(255,255,255,0.45)"
      shadow="0 2px 8px rgba(1,35,212,0.22)"
      shadowHover="0 4px 14px rgba(1,35,212,0.30)"
    >
      {children}
    </RippleButton>
  );
}

// ─── PrimaryWhiteButton (white-on-hero — for gradient hero overlays) ────────
export function PrimaryWhiteButton({
  onClick, children, className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RippleButton
      onClick={onClick}
      className={className}
      bg="white"
      bgHover="#F1F5F9"
      color={N}
      rippleColor={`${N}33`}
      shadow="0 2px 8px rgba(0,0,0,0.15)"
      shadowHover="0 4px 14px rgba(0,0,0,0.22)"
    >
      {children}
    </RippleButton>
  );
}

// ─── DangerButton (solid red + ripple — for "Request" / destructive) ────────
export function DangerButton({
  onClick, children, className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RippleButton
      onClick={onClick}
      className={className}
      bg={BAD}
      bgHover="#991B1B"
      color="white"
      rippleColor="rgba(255,255,255,0.45)"
      shadow={`0 2px 8px ${BAD}30`}
      shadowHover={`0 4px 14px ${BAD}40`}
      padding="6px 12px"
    >
      {children}
    </RippleButton>
  );
}

// ─── GhostButton (translucent overlay — used on hero gradients) ─────────────
export function GhostButton({
  onClick, children, className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RippleButton
      onClick={onClick}
      className={className}
      bg="rgba(255,255,255,0.12)"
      bgHover="rgba(255,255,255,0.22)"
      color="white"
      border="1px solid rgba(255,255,255,0.3)"
      rippleColor="rgba(255,255,255,0.3)"
    >
      {children}
    </RippleButton>
  );
}
