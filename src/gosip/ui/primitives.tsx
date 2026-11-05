import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Info } from "lucide-react-native";
import { BP, C, F, GOLD_GRADIENT, R } from "../theme/tokens";
import { useGoSip } from "../store/GoSipProvider";

// ─── Layout hook ─────────────────────────────────────────────────────────────
export function useLayout() {
  const dims = useWindowDimensions();
  const { hydrated } = useGoSip();
  // Static web rendering happens with a 0×0 window. Report the same size on the
  // first client render so hydration matches, then switch to the real size.
  const ssrSafe = Platform.OS === "web" && !hydrated;
  const width = ssrSafe ? 0 : dims.width;
  const height = ssrSafe ? 0 : dims.height;
  const isDesktop = width >= BP.desktop;
  const isTablet = width >= BP.tablet;
  return {
    width,
    height,
    isDesktop,
    isTablet,
    gutter: isDesktop ? 32 : isTablet ? 24 : 16,
    cols: (mobile: number, tablet: number, desktop: number) => (isDesktop ? desktop : isTablet ? tablet : mobile),
  };
}

// ─── Typography ──────────────────────────────────────────────────────────────
type Variant = "hero" | "display" | "h1" | "h2" | "h3" | "body" | "bodyStrong" | "small" | "label" | "number" | "caption";

const variantStyle: Record<Variant, TextStyle> = {
  hero: { fontFamily: F.displayBold, fontSize: 44, lineHeight: 50, color: C.ivory, letterSpacing: -0.5 },
  display: { fontFamily: F.display, fontSize: 32, lineHeight: 38, color: C.ivory },
  h1: { fontFamily: F.display, fontSize: 26, lineHeight: 32, color: C.ivory },
  h2: { fontFamily: F.semibold, fontSize: 19, lineHeight: 25, color: C.ivory },
  h3: { fontFamily: F.semibold, fontSize: 16, lineHeight: 21, color: C.ivory },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.muted },
  bodyStrong: { fontFamily: F.medium, fontSize: 15, lineHeight: 22, color: C.ivory },
  small: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: C.muted },
  caption: { fontFamily: F.body, fontSize: 11.5, lineHeight: 16, color: C.mutedDim },
  label: { fontFamily: F.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 2.2, color: C.gold, textTransform: "uppercase" },
  number: { fontFamily: F.bold, fontSize: 28, lineHeight: 32, color: C.ivory, letterSpacing: -0.5 },
};

export function T({ v = "body", color, style, center, ...rest }: TextProps & { v?: Variant; color?: string; center?: boolean }) {
  const { isRTL } = useGoSip();
  return (
    <Text
      {...rest}
      style={[variantStyle[v], color ? { color } : null, center ? { textAlign: "center" } : isRTL ? { textAlign: "right" } : null, style]}
    />
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────
interface BtnProps {
  label: string;
  onPress?: () => void;
  variant?: "gold" | "outline" | "ghost" | "ivory" | "danger";
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: "md" | "lg" | "sm";
  style?: StyleProp<ViewStyle>;
  full?: boolean;
  testID?: string;
}

export function Button({ label, onPress, variant = "gold", icon, disabled, loading, size = "md", style, full, testID }: BtnProps) {
  const h = size === "lg" ? 54 : size === "sm" ? 38 : 48;
  const textColor = variant === "gold" || variant === "ivory" ? C.ink : variant === "danger" ? C.danger : C.gold;
  const content = (
    <View style={[styles.btnInner, { height: h, paddingHorizontal: size === "sm" ? 14 : 22 }]}>
      {loading ? <ActivityIndicator color={textColor} /> : icon}
      <Text style={[styles.btnText, { color: textColor, fontSize: size === "sm" ? 13 : 15 }]}>{label}</Text>
    </View>
  );
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.btn,
        full && { alignSelf: "stretch" },
        variant === "outline" && { borderWidth: 1, borderColor: C.gold },
        variant === "ghost" && { backgroundColor: C.goldWash },
        variant === "ivory" && { backgroundColor: C.ivory },
        variant === "danger" && { backgroundColor: C.dangerWash, borderWidth: 1, borderColor: "rgba(226,120,106,0.35)" },
        (disabled || loading) && { opacity: 0.45 },
        hovered && !disabled && { opacity: 0.92 },
        pressed && { transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {variant === "gold" ? (
        <LinearGradient colors={GOLD_GRADIENT as unknown as string[] as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: R.pill }}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

// ─── Surfaces ────────────────────────────────────────────────────────────────
export function Card({ children, style, tone = "navy", padded = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: "navy" | "ivory" | "raised" | "gold"; padded?: boolean }) {
  return (
    <View
      style={[
        styles.card,
        tone === "ivory" && { backgroundColor: C.ivory, borderColor: "transparent" },
        tone === "raised" && { backgroundColor: C.cardRaised },
        tone === "gold" && { backgroundColor: C.goldWash, borderColor: C.line },
        padded && { padding: 18 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.lineSoft }, style]} />;
}

export function GoldRule({ width = 48, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width, height: 2, borderRadius: 1, backgroundColor: C.gold }, style]} />;
}

export function SectionHeader({ title, action, onAction, eyebrow }: { title: string; action?: string; onAction?: () => void; eyebrow?: string }) {
  const { isRTL } = useGoSip();
  return (
    <View style={[styles.sectionHeader, isRTL && { flexDirection: "row-reverse" }]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <T v="label" style={{ marginBottom: 6 }}>{eyebrow}</T> : null}
        <T v="h1" style={{ fontSize: 24, lineHeight: 30 }}>{title}</T>
      </View>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="link">
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Badge({ label, tone = "gold", style }: { label: string; tone?: "gold" | "success" | "danger" | "muted" | "solid"; style?: StyleProp<ViewStyle> }) {
  const map = {
    gold: { bg: C.goldWash, fg: C.gold, bd: C.line },
    success: { bg: C.successWash, fg: C.success, bd: "rgba(108,197,152,0.3)" },
    danger: { bg: C.dangerWash, fg: C.danger, bd: "rgba(226,120,106,0.3)" },
    muted: { bg: "rgba(255,255,255,0.06)", fg: C.muted, bd: C.lineSoft },
    solid: { bg: C.gold, fg: C.ink, bd: C.gold },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg, borderColor: map.bd }, style]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, icon, testID }: { label: string; active?: boolean; onPress?: () => void; icon?: React.ReactNode; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ hovered }: any) => [styles.chip, active && styles.chipActive, hovered && !active && { borderColor: C.bronze }]}
    >
      {icon}
      <Text style={[styles.chipText, active && { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function DemoNotice({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.notice, style]}>
      <Info size={15} color={C.gold} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

export function ListRow({ icon, title, subtitle, onPress, right, testID }: { icon?: React.ReactNode; title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode; testID?: string }) {
  const { isRTL } = useGoSip();
  return (
    <Pressable testID={testID} onPress={onPress} disabled={!onPress} style={({ hovered }: any) => [styles.row, isRTL && { flexDirection: "row-reverse" }, hovered && onPress && { backgroundColor: "rgba(255,255,255,0.03)" }]}>
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <View style={{ flex: 1 }}>
        <T v="bodyStrong">{title}</T>
        {subtitle ? <T v="small" style={{ marginTop: 2 }}>{subtitle}</T> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={C.mutedDim} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} /> : null)}
    </Pressable>
  );
}

export function Toggle({ value, onChange, testID }: { value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <Switch
      testID={testID}
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#2A3646", true: C.warmGold }}
      thumbColor={value ? C.ivory : "#C9CED6"}
      {...({ activeThumbColor: C.ivory } as object)}
    />
  );
}

export function Field({ label, style, ...rest }: TextInputProps & { label?: string }) {
  const [focus, setFocus] = React.useState(false);
  const { isRTL } = useGoSip();
  return (
    <View style={{ gap: 6 }}>
      {label ? <T v="small" color={C.muted}>{label}</T> : null}
      <TextInput
        placeholderTextColor={C.mutedDim}
        {...rest}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[styles.field, focus && { borderColor: C.gold }, isRTL && { textAlign: "right" }, { outlineStyle: "none" } as any, style]}
      />
    </View>
  );
}

export function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && { color: C.gold }]}>{value}</Text>
      <T v="caption" style={{ color: C.muted }}>{label}</T>
    </View>
  );
}

export function Grid({ children, cols, gap = 16 }: { children: React.ReactNode; cols: number; gap?: number }) {
  const items = React.Children.toArray(children);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }}>
      {items.map((child, i) => (
        <View key={i} style={{ width: `${100 / cols}%`, paddingHorizontal: gap / 2, marginBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: R.pill, overflow: "hidden", alignSelf: "flex-start" },
  btnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { fontFamily: F.bold, letterSpacing: 0.6 },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.lineSoft },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", marginBottom: 16 },
  sectionAction: { fontFamily: F.semibold, fontSize: 13, color: C.gold, letterSpacing: 0.4 },
  badge: { borderRadius: R.pill, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontFamily: F.semibold, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 36, borderRadius: R.pill, borderWidth: 1, borderColor: C.lineSoft, backgroundColor: "rgba(255,255,255,0.03)" },
  chipActive: { backgroundColor: C.gold, borderColor: C.gold },
  chipText: { fontFamily: F.medium, fontSize: 13, color: C.ivory },
  notice: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 12, borderRadius: R.md, backgroundColor: C.goldWash, borderWidth: 1, borderColor: C.line },
  noticeText: { flex: 1, fontFamily: F.body, fontSize: 12.5, lineHeight: 18, color: C.ivoryDim },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 4 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center" },
  field: { height: 50, borderRadius: R.md, borderWidth: 1, borderColor: C.lineSoft, backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 16, color: C.ivory, fontFamily: F.body, fontSize: 15 },
  stat: { flex: 1, gap: 4 },
  statValue: { fontFamily: F.bold, fontSize: 24, color: C.ivory, letterSpacing: -0.4 },
});
