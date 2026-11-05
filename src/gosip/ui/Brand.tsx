import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Rect, Stop, Circle, G } from "react-native-svg";
import { BRAND } from "../config/brand";
import { C, F } from "../theme/tokens";

/** Martini-glass symbol (vector, scales cleanly). */
export function MartiniMark({ size = 40, color = C.gold, glow = false }: { size?: number; color?: string; glow?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {glow ? <Circle cx="24" cy="22" r="22" fill={color} opacity={0.07} /> : null}
      {/* bowl */}
      <Path d="M8 10 H40 L25.2 26.4 a1.6 1.6 0 0 1 -2.4 0 Z" fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
      {/* liquid */}
      <Path d="M13.2 14.2 H34.8 L24 26 Z" fill={color} opacity={0.85} />
      {/* olive pick */}
      <Path d="M30 6 L22 18" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="22.6" cy="17" r="2.2" fill={C.midnight} stroke={color} strokeWidth={1.4} />
      {/* stem + foot */}
      <Path d="M24 27 V39" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M16.5 40.5 H31.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * GoSip wordmark — "GOSIP" with the martini glass replacing the dot of the i.
 * Built from text + SVG so it stays crisp at every size, on web and native.
 */
export function GoSipLogo({
  size = 34,
  showTagline = true,
  color = C.gold,
  align = "center",
  style,
}: {
  size?: number;
  showTagline?: boolean;
  color?: string;
  align?: "center" | "flex-start";
  style?: StyleProp<ViewStyle>;
}) {
  const letter = { fontFamily: F.bold, fontSize: size, lineHeight: size * 1.08, color, letterSpacing: size * 0.04, includeFontPadding: false } as const;
  const iW = size * 0.36;
  const iH = size * 1.08;
  return (
    <View style={[{ alignItems: align }, style]} accessibilityRole="header" accessibilityLabel={`${BRAND.name} — ${BRAND.tagline}`}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", direction: "ltr" }}>
        <Text style={letter}>GOS</Text>
        <View style={{ width: iW, height: iH, marginHorizontal: size * 0.02 }}>
          <Svg width={iW} height={iH} viewBox="0 0 36 108">
            {/* stem of the i (sits on the cap-height baseline) */}
            <Rect x="11" y="44" width="14" height="52" rx="2" fill={color} />
            {/* martini glass dot */}
            <Path d="M2 10 H34 L19.4 27 a2 2 0 0 1 -2.8 0 Z" fill={color} />
            <Rect x="16.4" y="26" width="3.2" height="10" fill={color} />
            <Rect x="10" y="35" width="16" height="3" rx="1.5" fill={color} />
          </Svg>
        </View>
        <Text style={letter}>P</Text>
      </View>
      {showTagline ? (
        <Text style={[styles.tagline, { fontSize: Math.max(8, size * 0.24), letterSpacing: size * 0.09, color: C.ivoryDim, marginTop: size * 0.12 }]}>
          {BRAND.tagline}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Dubai skyline silhouette ────────────────────────────────────────────────
type B = { x: number; w: number; h: number; kind?: "spire" | "point" | "burj" | "sail" | "frame" | "twin" };

const BUILDINGS: B[] = [
  { x: 0, w: 46, h: 70 }, { x: 40, w: 34, h: 104 }, { x: 70, w: 28, h: 84, kind: "point" },
  { x: 102, w: 56, h: 150, kind: "sail" }, { x: 168, w: 30, h: 92 }, { x: 196, w: 40, h: 128, kind: "point" },
  { x: 238, w: 26, h: 110 }, { x: 262, w: 38, h: 162, kind: "twin" }, { x: 304, w: 30, h: 120 },
  { x: 336, w: 44, h: 96 }, { x: 382, w: 30, h: 176, kind: "spire" }, { x: 414, w: 40, h: 134 },
  { x: 456, w: 28, h: 150, kind: "point" }, { x: 486, w: 36, h: 118 },
  { x: 528, w: 64, h: 292, kind: "burj" },
  { x: 598, w: 34, h: 140 }, { x: 634, w: 28, h: 182, kind: "point" }, { x: 664, w: 46, h: 126 },
  { x: 712, w: 32, h: 160, kind: "spire" }, { x: 746, w: 40, h: 104 }, { x: 788, w: 54, h: 132, kind: "frame" },
  { x: 846, w: 30, h: 146 }, { x: 878, w: 38, h: 112, kind: "point" }, { x: 918, w: 30, h: 168, kind: "twin" },
  { x: 952, w: 44, h: 98 }, { x: 998, w: 30, h: 124, kind: "spire" }, { x: 1030, w: 40, h: 86 },
  { x: 1072, w: 32, h: 116 }, { x: 1106, w: 48, h: 78 }, { x: 1156, w: 44, h: 96 },
];

function buildingPath(b: B, base: number) {
  const top = base - b.h;
  const r = b.x + b.w;
  switch (b.kind) {
    case "point":
      return `M${b.x} ${base} V${top + 16} L${b.x + b.w / 2} ${top} L${r} ${top + 16} V${base} Z`;
    case "spire":
      return `M${b.x} ${base} V${top + 18} H${b.x + b.w * 0.42} V${top - 22} H${b.x + b.w * 0.58} V${top + 18} H${r} V${base} Z`;
    case "twin":
      return `M${b.x} ${base} V${top + 12} L${b.x + b.w * 0.3} ${top} L${b.x + b.w * 0.45} ${top + 10} V${top + 24} H${b.x + b.w * 0.55} V${top + 10} L${b.x + b.w * 0.7} ${top} L${r} ${top + 12} V${base} Z`;
    case "frame":
      return `M${b.x} ${base} V${top} H${r} V${base} H${r - 8} V${top + 8} H${b.x + 8} V${base} Z`;
    case "sail": {
      // Burj Al Arab inspired sail
      return `M${b.x} ${base} V${top + 24} Q${b.x + b.w * 0.15} ${top + 6} ${b.x + b.w * 0.2} ${top} L${b.x + b.w * 0.24} ${top - 14} L${b.x + b.w * 0.3} ${top + 4} Q${r + 8} ${top + b.h * 0.45} ${r} ${base} Z`;
    }
    case "burj": {
      // Burj Khalifa inspired setbacks + needle
      const cx = b.x + b.w / 2;
      const steps = [1, 0.82, 0.64, 0.48, 0.34, 0.22, 0.12];
      let d = `M${b.x} ${base}`;
      const stepH = (b.h - 70) / steps.length;
      steps.forEach((s, i) => {
        const half = (b.w * s) / 2;
        const y = base - stepH * (i + 1);
        d += ` L${cx - half} ${base - stepH * i} L${cx - half} ${y}`;
      });
      d += ` L${cx - 2} ${top + 70} L${cx} ${top} L${cx + 2} ${top + 70}`;
      [...steps].reverse().forEach((s, ri) => {
        const i = steps.length - 1 - ri;
        const half = (b.w * s) / 2;
        d += ` L${cx + half} ${base - stepH * (i + 1)} L${cx + half} ${base - stepH * i}`;
      });
      return `${d} L${r} ${base} Z`;
    }
    default:
      return `M${b.x} ${base} V${top} H${r} V${base} Z`;
  }
}

/** Vector Dubai skyline — used on the splash, heroes and footers. */
export function DubaiSkyline({
  height = 160,
  color = "#0F2236",
  windows = true,
  reflection = false,
  style,
}: {
  height?: number;
  color?: string;
  windows?: boolean;
  reflection?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const base = 300;
  const lights = useMemo(() => {
    const pts: { x: number; y: number; o: number }[] = [];
    let s = 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (const b of BUILDINGS) {
      if (b.kind === "burj" || b.kind === "sail") continue;
      const cols = Math.max(1, Math.floor(b.w / 9));
      const rows = Math.floor((b.h - 24) / 12);
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
          if (rnd() > 0.72) pts.push({ x: b.x + 5 + c * 9, y: base - 10 - r * 12, o: 0.25 + rnd() * 0.6 });
    }
    return pts;
  }, []);
  return (
    <View style={[{ width: "100%", height: reflection ? height * 1.25 : height, overflow: "hidden", pointerEvents: "none" }, style]}>
      <Svg width="100%" height={height} viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
        <G>
          {BUILDINGS.map((b, i) => (
            <Path key={i} d={buildingPath(b, base)} fill={color} />
          ))}
          {windows
            ? lights.map((p, i) => <Rect key={`w${i}`} x={p.x} y={p.y} width={2.4} height={3.2} fill={C.gold} opacity={p.o} />)
            : null}
        </G>
      </Svg>
      {reflection ? (
        <Svg width="100%" height={height * 0.25} viewBox="0 0 1200 75" preserveAspectRatio="xMidYMin slice">
          <Defs>
            <SvgGradient id="refl" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.gold} stopOpacity={0.18} />
              <Stop offset="1" stopColor={C.gold} stopOpacity={0} />
            </SvgGradient>
          </Defs>
          <Rect x="0" y="0" width="1200" height="75" fill="url(#refl)" />
          {[90, 300, 560, 720, 930].map((x, i) => (
            <Rect key={i} x={x} y={6 + (i % 3) * 8} width={60 + (i % 2) * 40} height={1.4} fill={C.gold} opacity={0.35} />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tagline: { fontFamily: F.medium, textTransform: "uppercase" },
});
