import React, { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Gift, MapPin, Martini, Percent, Sparkles, Crown } from "lucide-react-native";
import { BRAND } from "@/gosip/config/brand";
import { IMAGES, type ImageKey } from "@/gosip/data/images";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { GoSipLogo } from "@/gosip/ui/Brand";
import { Photo } from "@/gosip/ui/Media";
import { Button, T, useLayout } from "@/gosip/ui/primitives";
import type { StringKey } from "@/gosip/i18n/strings";

const SLIDES: { title: StringKey; body: StringKey; image: ImageKey }[] = [
  { title: "onb.s1.title", body: "onb.s1.body", image: "skylineDusk" },
  { title: "onb.s2.title", body: "onb.s2.body", image: "loungeCocktails" },
  { title: "onb.s3.title", body: "onb.s3.body", image: "foodSignature" },
];

const FEATURES = [
  { Icon: Crown, text: "Welcome to GoSip — the UAE's hospitality membership" },
  { Icon: MapPin, text: "Discover premium restaurants, bars, lounges & hotels" },
  { Icon: Martini, text: "Enjoy two complimentary drinks every day" },
  { Icon: Gift, text: "Access member-exclusive benefits & events" },
  { Icon: Percent, text: "Explore 20% food discounts at participating venues" },
  { Icon: Sparkles, text: "Find curated experiences across the UAE" },
];

export default function Onboarding() {
  const router = useRouter();
  const { t, dispatch, state, lang } = useGoSip();
  const { width, height, isDesktop } = useLayout();
  const [index, setIndex] = useState(0);
  const pager = useRef<ScrollView>(null);
  const slideW = isDesktop ? Math.min(width * 0.5, 720) : width;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / slideW);
    if (i !== index) setIndex(i);
  };
  const goTo = (i: number) => {
    setIndex(i);
    pager.current?.scrollTo({ x: i * slideW, animated: true });
  };

  const explore = () => {
    if (!state.session) dispatch({ type: "SIGN_IN_DEMO" });
    router.replace("/");
  };

  const actions = (
    <View style={{ gap: 12, width: "100%" }}>
      <Button testID="join-now" label={t("common.joinNow")} size="lg" full onPress={() => router.push("/login?mode=signup")} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button testID="sign-in" label={t("common.signIn")} variant="outline" style={{ flex: 1 }} full onPress={() => router.push("/login?mode=signin")} />
        <Button testID="explore-demo" label={t("onb.explore")} variant="ghost" style={{ flex: 1 }} full onPress={explore} />
      </View>
      <Pressable onPress={() => dispatch({ type: "SET_LANGUAGE", lang: lang === "en" ? "ar" : "en" })} style={{ alignSelf: "center", padding: 6 }}>
        <Text style={styles.lang}>{lang === "en" ? "العربية" : "English"}</Text>
      </Pressable>
    </View>
  );

  const slides = (
    <ScrollView
      ref={pager}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={32}
      style={{ width: slideW }}
    >
      {SLIDES.map((s, i) => (
        <View key={s.title} style={{ width: slideW, height: isDesktop ? height - 0 : height * 0.56 }}>
          <Photo imageKey={s.image} style={StyleSheet.absoluteFill} overlay={false} />
          <LinearGradient colors={["rgba(7,19,33,0.25)", "rgba(7,19,33,0.1)", C.midnight]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          {isDesktop ? (
            <View style={styles.slideCaption}>
              <Text style={styles.slideNo}>0{i + 1}</Text>
              <T v="display" style={{ maxWidth: 520 }}>{t(s.title)}</T>
              <T v="body" style={{ maxWidth: 480, marginTop: 10, color: C.ivoryDim }}>{t(s.body)}</T>
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );

  const dots = (
    <View style={styles.dots}>
      {SLIDES.map((_, i) => (
        <Pressable key={i} onPress={() => goTo(i)} accessibilityLabel={`Slide ${i + 1}`} hitSlop={8}>
          <View style={[styles.dot, i === index && styles.dotActive]} />
        </Pressable>
      ))}
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktop} testID="onboarding-screen">
        <StatusBar barStyle="light-content" />
        <View style={styles.dLeft}>
          <GoSipLogo size={40} align="flex-start" />
          <View style={{ marginTop: 56 }}>
            <T v="label">{t("onb.welcome")}</T>
            <T v="hero" style={{ marginTop: 14, fontSize: 52, lineHeight: 60 }}>More than just drinks…{"\n"}<Text style={{ color: C.gold }}>it's a lifestyle.</Text></T>
            <T v="body" style={{ marginTop: 18, maxWidth: 520, fontSize: 16, lineHeight: 25 }}>{BRAND.description}</T>
          </View>
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <View key={f.text} style={[styles.feature, { width: "50%", paddingRight: 16 }]}>
                <View style={styles.featureIcon}><f.Icon size={18} color={C.gold} /></View>
                <T v="small" style={{ flex: 1, color: C.ivoryDim }}>{f.text}</T>
              </View>
            ))}
          </View>
          <View style={{ maxWidth: 460, marginTop: 36 }}>{actions}</View>
        </View>
        <View style={{ width: slideW }}>
          {slides}
          <View style={[styles.dotsWrap, { bottom: 40 }]}>{dots}</View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.root} testID="onboarding-screen">
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} bounces={false}>
        <View>
          {slides}
          <View style={[styles.logoOverlay, { pointerEvents: "none" }]}>
            <GoSipLogo size={34} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 22, marginTop: -40 }}>
          {dots}
          <T v="label" center style={{ marginTop: 18 }}>{t("onb.welcome")}</T>
          <T v="display" center style={{ marginTop: 10 }}>{t(SLIDES[index].title)}</T>
          <T v="body" center style={{ marginTop: 10 }}>{t(SLIDES[index].body)}</T>
          <View style={styles.featureList}>
            {FEATURES.slice(1).map((f) => (
              <View key={f.text} style={styles.feature}>
                <View style={styles.featureIcon}><f.Icon size={16} color={C.gold} /></View>
                <T v="small" style={{ flex: 1, color: C.ivoryDim }}>{f.text}</T>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 24 }}>{actions}</View>
          <T v="caption" center style={{ marginTop: 14 }}>{BRAND.legalAgeNotice}</T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.midnight },
  logoOverlay: { position: "absolute", top: 58, left: 0, right: 0, alignItems: "center" },
  dots: { flexDirection: "row", gap: 8, justifyContent: "center" },
  dotsWrap: { position: "absolute", left: 0, right: 0 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)" },
  dotActive: { width: 26, backgroundColor: C.gold },
  featureList: { marginTop: 20, gap: 10, padding: 16, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  feature: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  lang: { fontFamily: F.medium, fontSize: 13, color: C.gold },
  desktop: { flex: 1, flexDirection: "row", backgroundColor: C.midnight },
  dLeft: { flex: 1, paddingHorizontal: 64, paddingVertical: 48, justifyContent: "center" },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 32, rowGap: 14, maxWidth: 640 },
  slideCaption: { position: "absolute", left: 48, right: 48, bottom: 80 },
  slideNo: { fontFamily: F.display, fontSize: 15, color: C.gold, marginBottom: 12, letterSpacing: 2 },
});
