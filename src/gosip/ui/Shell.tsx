import React from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter, type Href } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { ChevronLeft, CreditCard, Home, MapPin, Martini, User, Globe } from "lucide-react-native";
import { C, F, MAX_W, R } from "../theme/tokens";
import { useGoSip } from "../store/GoSipProvider";
import type { StringKey } from "../i18n/strings";
import { GoSipLogo } from "./Brand";
import { T, useLayout } from "./primitives";

export const NAV_ITEMS: { route: string; href: Href; key: StringKey; Icon: typeof Home }[] = [
  { route: "index", href: "/", key: "nav.home", Icon: Home },
  { route: "venues", href: "/venues", key: "nav.venues", Icon: MapPin },
  { route: "drinks", href: "/drinks", key: "nav.drinks", Icon: Martini },
  { route: "card", href: "/card", key: "nav.card", Icon: CreditCard },
  { route: "profile", href: "/profile", key: "nav.profile", Icon: User },
];

export function goBack(router: ReturnType<typeof useRouter>, fallback: Href = "/") {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

// ─── Desktop / laptop top navigation ────────────────────────────────────────
export function DesktopNav() {
  const router = useRouter();
  const path = usePathname();
  const { t, member, plan, dispatch, lang, isRTL } = useGoSip();
  const links: { href: Href; label: string; match: (p: string) => boolean }[] = [
    { href: "/", label: t("nav.home"), match: (p) => p === "/" },
    { href: "/venues", label: t("nav.venues"), match: (p) => p.startsWith("/venue") },
    { href: "/drinks", label: t("nav.drinks"), match: (p) => p.startsWith("/drinks") || p.startsWith("/redeem") },
    { href: "/card", label: t("nav.card"), match: (p) => p.startsWith("/card") },
    { href: "/offers", label: t("nav.offers"), match: (p) => p.startsWith("/offers") },
    { href: "/profile", label: t("nav.profile"), match: (p) => p.startsWith("/profile") || p.startsWith("/usage") || p.startsWith("/security") },
  ];
  return (
    <View style={styles.dnav}>
      <View style={[styles.dnavInner, isRTL && { flexDirection: "row-reverse" }]}>
        <Pressable onPress={() => router.push("/")} accessibilityRole="link" accessibilityLabel="GoSip home">
          <GoSipLogo size={24} align="flex-start" />
        </Pressable>
        <View style={[styles.dlinks, isRTL && { flexDirection: "row-reverse" }]}>
          {links.map((l) => {
            const active = l.match(path);
            return (
              <Pressable key={l.label} onPress={() => router.push(l.href)} style={({ hovered }: any) => [styles.dlink, hovered && { backgroundColor: "rgba(255,255,255,0.04)" }]} accessibilityRole="link">
                <Text style={[styles.dlinkText, active && { color: C.gold }]}>{l.label}</Text>
                {active ? <View style={styles.dlinkBar} /> : null}
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.dright, isRTL && { flexDirection: "row-reverse" }]}>
          <Pressable
            onPress={() => dispatch({ type: "SET_LANGUAGE", lang: lang === "en" ? "ar" : "en" })}
            style={styles.langBtn}
            accessibilityLabel="Switch language"
            testID="lang-toggle"
          >
            <Globe size={14} color={C.gold} />
            <Text style={styles.langText}>{lang === "en" ? "العربية" : "English"}</Text>
          </Pressable>
          {member ? (
            <Pressable onPress={() => router.push("/profile")} style={styles.avatar} accessibilityLabel="Profile">
              <Text style={styles.avatarText}>{member.avatarInitials}</Text>
            </Pressable>
          ) : null}
          {!member || !plan ? (
            <Pressable onPress={() => router.push(member ? "/packages" : "/login")} style={styles.joinBtn}>
              <Text style={styles.joinText}>{t("common.joinNow")}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── Mobile bottom tab bar ───────────────────────────────────────────────────
export function GoSipTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const { t, isRTL } = useGoSip();
  if (isDesktop) return null;
  const items = isRTL ? [...NAV_ITEMS].reverse() : NAV_ITEMS;
  return (
    <View style={[styles.tabbar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item) => {
        const routeIndex = state.routes.findIndex((r) => r.name === item.route);
        const route = state.routes[routeIndex];
        const focused = state.index === routeIndex;
        const color = focused ? C.gold : C.mutedDim;
        return (
          <Pressable
            key={item.route}
            testID={`tab-${item.route}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={t(item.key)}
            onPress={() => {
              if (!route) return;
              const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.tab}
          >
            {focused ? <View style={styles.tabGlow} /> : null}
            <item.Icon size={21} color={color} strokeWidth={focused ? 2.3 : 1.8} />
            <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>{t(item.key)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Screen wrapper ──────────────────────────────────────────────────────────
export function Screen({
  children,
  title,
  back,
  right,
  scroll = true,
  hideNav,
  maxWidth = MAX_W,
  contentStyle,
  edgeToEdge,
  testID,
}: {
  children: React.ReactNode;
  title?: string;
  back?: boolean | Href;
  right?: React.ReactNode;
  scroll?: boolean;
  hideNav?: boolean;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Children control their own horizontal padding. */
  edgeToEdge?: boolean;
  testID?: string;
}) {
  const router = useRouter();
  const { isDesktop, gutter } = useLayout();
  const { isRTL } = useGoSip();
  const showHeader = !!title || !!back || !!right;
  const inner = (
    <View style={[{ width: "100%", maxWidth, alignSelf: "center", paddingHorizontal: edgeToEdge ? 0 : gutter }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { direction: isRTL ? "rtl" : "ltr" }]} testID={testID}>
      <StatusBar barStyle="light-content" backgroundColor={C.midnight} />
      {isDesktop && !hideNav ? <DesktopNav /> : null}
      {showHeader ? (
        <View style={[styles.header, { paddingHorizontal: gutter, maxWidth, width: "100%", alignSelf: "center" }]}>
          <View style={styles.headerSide}>
            {back ? (
              <Pressable
                testID="back-button"
                accessibilityLabel="Back"
                onPress={() => (typeof back === "string" || typeof back === "object" ? router.replace(back as Href) : goBack(router))}
                style={styles.backBtn}
              >
                <ChevronLeft size={20} color={C.ivory} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
              </Pressable>
            ) : null}
          </View>
          {title ? <T v="h2" center style={{ flex: 1 }} numberOfLines={1}>{title}</T> : <View style={{ flex: 1 }} />}
          <View style={[styles.headerSide, { alignItems: "flex-end" }]}>{right}</View>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={Platform.OS === "web"}>
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.midnight },
  header: { flexDirection: "row", alignItems: "center", height: 56 },
  headerSide: { width: 64 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.lineSoft },
  dnav: { borderBottomWidth: 1, borderBottomColor: C.lineSoft, backgroundColor: "rgba(7,19,33,0.96)", zIndex: 10 },
  dnavInner: { maxWidth: MAX_W + 64, width: "100%", alignSelf: "center", paddingHorizontal: 32, height: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dlinks: { flexDirection: "row", gap: 4 },
  dlink: { paddingHorizontal: 14, height: 40, justifyContent: "center", borderRadius: R.sm },
  dlinkText: { fontFamily: F.medium, fontSize: 14, color: C.ivoryDim, letterSpacing: 0.3 },
  dlinkBar: { position: "absolute", bottom: 2, left: 14, right: 14, height: 2, borderRadius: 1, backgroundColor: C.gold },
  dright: { flexDirection: "row", alignItems: "center", gap: 12 },
  langBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 34, borderRadius: R.pill, borderWidth: 1, borderColor: C.line },
  langText: { fontFamily: F.medium, fontSize: 12.5, color: C.gold },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.goldWash, borderWidth: 1, borderColor: C.gold, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: F.bold, fontSize: 12, color: C.gold },
  joinBtn: { backgroundColor: C.gold, paddingHorizontal: 18, height: 36, borderRadius: R.pill, justifyContent: "center" },
  joinText: { fontFamily: F.bold, fontSize: 12.5, color: C.ink, letterSpacing: 1 },
  tabbar: { flexDirection: "row", backgroundColor: "#0A1828", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 4 },
  tabGlow: { position: "absolute", top: -8, width: 28, height: 2, borderRadius: 1, backgroundColor: C.gold },
  tabLabel: { fontFamily: F.medium, fontSize: 10.5, letterSpacing: 0.2 },
});
