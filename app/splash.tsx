import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BRAND } from "@/gosip/config/brand";
import { DubaiSkyline, GoSipLogo, MartiniMark } from "@/gosip/ui/Brand";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { intro } from "@/gosip/session";
import { C, F } from "@/gosip/theme/tokens";
import { useLayout } from "@/gosip/ui/primitives";

/**
 * Cinematic GoSip opening:
 * midnight → skyline silhouette → martini symbol → wordmark → gold light
 * sweep → tagline → transition to onboarding (or home when signed in).
 */
export default function Splash() {
  const router = useRouter();
  const { state } = useGoSip();
  const { width, isDesktop } = useLayout();
  const sessionRef = useRef(state.session);
  sessionRef.current = state.session;

  const sky = useRef(new Animated.Value(0)).current;
  const mark = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    intro.markShown();
    Animated.timing(out, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => {
      router.replace(sessionRef.current ? "/" : "/onboarding");
    });
  };

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(sky, { toValue: 1, duration: 900, easing: ease, useNativeDriver: true }),
        Animated.timing(mark, { toValue: 1, duration: 800, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(word, { toValue: 1, duration: 600, easing: ease, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(sweep, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(tag, { toValue: 1, duration: 700, delay: 200, easing: ease, useNativeDriver: true }),
        ]),
      ]),
    ]).start(() => setTimeout(finish, 450));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoSize = isDesktop ? 64 : 48;
  const sweepX = sweep.interpolate({ inputRange: [0, 1], outputRange: [-logoSize * 4, logoSize * 4] });

  return (
    <Animated.View style={[styles.root, { opacity: out }]} testID="splash-screen">
      <StatusBar barStyle="light-content" backgroundColor={C.midnight} />
      <LinearGradient colors={["#0B1B2E", C.midnight, "#05101C"]} style={StyleSheet.absoluteFill} />
      <View style={[styles.haloWrap, { pointerEvents: "none" }]}>
        {[1, 0.78, 0.58, 0.4, 0.26].map((k) => (
          <View key={k} style={{ position: "absolute", width: 560 * k, height: 560 * k, borderRadius: 280 * k, backgroundColor: C.gold, opacity: 0.018 }} />
        ))}
      </View>

      {/* Skyline */}
      <Animated.View
        style={[
          styles.sky,
          { opacity: sky, transform: [{ translateY: sky.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
        ]}
      >
        <DubaiSkyline height={isDesktop ? 280 : 210} color="#0F2438" reflection />
      </Animated.View>

      {/* Brand */}
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: mark,
            transform: [
              { scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
              { translateY: mark.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
            ],
            marginBottom: 18,
          }}
        >
          <MartiniMark size={isDesktop ? 84 : 66} glow />
        </Animated.View>
        <Animated.View style={{ opacity: word, transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }], overflow: "hidden" }}>
          <GoSipLogo size={logoSize} showTagline={false} />
          <Animated.View style={[styles.sweep, { pointerEvents: "none" }, { transform: [{ translateX: sweepX }, { rotate: "18deg" }] }]}>
            <LinearGradient colors={["rgba(255,240,210,0)", "rgba(255,240,210,0.55)", "rgba(255,240,210,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.tagline, { opacity: tag, transform: [{ translateY: tag.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
          {BRAND.tagline}
        </Animated.Text>
      </View>

      {/* Loader */}
      <View style={styles.loader}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
        </View>
        <Text style={styles.loading}>Loading your premium hospitality experience…</Text>
      </View>

      <Pressable onPress={finish} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip intro" testID="skip-intro">
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.midnight, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  haloWrap: { position: "absolute", top: 0, bottom: 160, left: 0, right: 0, alignItems: "center", justifyContent: "center" },
  sky: { position: "absolute", left: 0, right: 0, bottom: 70 },
  center: { alignItems: "center", marginTop: -90 },
  sweep: { position: "absolute", top: -20, bottom: -20, width: 46, left: "40%" },
  tagline: { marginTop: 18, fontFamily: F.medium, color: C.ivoryDim, letterSpacing: 5, fontSize: 13 },
  loader: { position: "absolute", bottom: 34, alignItems: "center", gap: 10, width: 220 },
  track: { width: "100%", height: 2, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 1, overflow: "hidden" },
  bar: { height: 2, backgroundColor: C.gold },
  loading: { fontFamily: F.body, fontSize: 11, color: C.mutedDim, letterSpacing: 0.4 },
  skip: { position: "absolute", top: 48, right: 24, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.lineSoft },
  skipText: { fontFamily: F.medium, fontSize: 12, color: C.muted },
});
