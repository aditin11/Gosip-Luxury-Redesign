import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Clock, Heart, MapPin, Martini, Navigation, Phone, Shirt, Star, Utensils, Lock } from "lucide-react-native";
import { TIER_LABEL } from "@/gosip/config/plans";
import { getCity } from "@/gosip/data/locations";
import { VENUE_TYPE_SINGULAR } from "@/gosip/data/venues";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { Photo, monogramOf } from "@/gosip/ui/Media";
import { Badge, Button, Card, DemoNotice, T, useLayout } from "@/gosip/ui/primitives";
import { SAMPLE_VENUES } from "@/gosip/data/venues";
import { Screen, goBack } from "@/gosip/ui/Shell";
import { DrinkIcon } from "@/gosip/ui/DrinkIcon";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, marginTop: 22 }}>
      <T v="label">{title}</T>
      {children}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8 }}>
          <Text style={{ color: C.gold }}>•</Text>
          <T v="body" style={{ flex: 1, fontSize: 14 }}>{i}</T>
        </View>
      ))}
    </View>
  );
}

/** Pre-render sample venues for the static web export (admin-added venues still work via in-app navigation). */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return SAMPLE_VENUES.map((v) => ({ id: v.id }));
}

export default function VenueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { venueById, state, dispatch, plan, t, categories, membershipActive, member } = useGoSip();
  const { isDesktop, gutter } = useLayout();
  const venue = venueById(String(id));

  if (!venue) {
    return (
      <Screen title="Venue" back>
        <T v="h2" center style={{ marginTop: 40 }}>Venue not found</T>
        <Button label="Browse venues" onPress={() => router.replace("/venues")} style={{ alignSelf: "center", marginTop: 16 }} />
      </Screen>
    );
  }

  const saved = state.savedVenueIds.includes(venue.id);
  const cityName = getCity(venue.cityId)?.city.name ?? "";
  const tierOk = plan ? plan.venueTiers.includes(venue.tier) : true;
  const active = membershipActive();

  const openMaps = () => {
    const query = encodeURIComponent(`${venue.area}, ${cityName}`);
    const url = Platform.OS === "ios" ? `maps:0,0?q=${query}` : `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {});
  };

  const gallery = (
    <View style={[styles.hero, isDesktop && { height: 440, borderRadius: R.xl, marginTop: 24 }]}>
      <Photo imageKey={venue.imageKey} tint={venue.tint} monogram={monogramOf(venue.name)} style={StyleSheet.absoluteFill} overlay={false} />
      <LinearGradient colors={["rgba(7,19,33,0.55)", "rgba(7,19,33,0.05)", "rgba(7,19,33,0.96)"]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.heroTop, { paddingHorizontal: isDesktop ? 24 : gutter }]}>
        <Pressable testID="back-button" onPress={() => goBack(router, "/venues")} style={styles.round} accessibilityLabel="Back"><ChevronLeft size={20} color={C.ivory} /></Pressable>
        <Pressable testID="save-venue" onPress={() => dispatch({ type: "TOGGLE_SAVED", venueId: venue.id })} style={styles.round} accessibilityLabel={saved ? "Remove from saved" : "Save venue"}>
          <Heart size={18} color={saved ? C.gold : C.ivory} fill={saved ? C.gold : "transparent"} />
        </Pressable>
      </View>
      <View style={[styles.heroText, { paddingHorizontal: isDesktop ? 32 : gutter }]}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <Badge label={TIER_LABEL[venue.tier]} tone={venue.tier === "premium" ? "solid" : "gold"} />
          <Badge label={VENUE_TYPE_SINGULAR[venue.type]} tone="muted" />
          <Badge label={t("common.sample")} tone="muted" />
        </View>
        <T v="hero" style={!isDesktop && { fontSize: 34, lineHeight: 40 }}>{venue.name}</T>
        <T v="body" color={C.ivoryDim}>{venue.area}, {cityName}</T>
        <View style={styles.meta}>
          <Star size={14} color={C.gold} fill={C.gold} /><Text style={styles.metaT}>{venue.rating.toFixed(1)}</Text>
          <MapPin size={14} color={C.muted} /><Text style={styles.metaT}>{venue.distanceKm} km</Text>
          <Clock size={14} color={C.muted} /><Text style={styles.metaT}>{venue.hours[0].open}–{venue.hours[0].close}</Text>
          {venue.active ? <Badge label={t("common.openNow")} tone="success" /> : <Badge label="Coming soon" tone="muted" />}
        </View>
      </View>
    </View>
  );

  const actions = (
    <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
      <Pressable
        testID="redeem-drinks"
        disabled={!venue.active}
        onPress={() => router.push({ pathname: "/redeem/[venueId]", params: { venueId: venue.id } })}
        style={({ hovered }: any) => [styles.action, !venue.active && { opacity: 0.5 }, hovered && { backgroundColor: C.ivoryDim }]}
      >
        <Martini size={24} color={C.bronze} />
        <Text style={styles.actionT}>{t("venue.redeem")}</Text>
        <Text style={styles.actionS}>{venue.active ? t("venue.redeemSub") : "Opens at launch"}</Text>
      </Pressable>
      <Pressable testID="food-discount" onPress={() => router.push("/offers")} style={({ hovered }: any) => [styles.action, hovered && { backgroundColor: C.ivoryDim }]}>
        <Utensils size={24} color={C.bronze} />
        <Text style={styles.actionT}>{t("venue.food")}</Text>
        <Text style={styles.actionS}>{venue.foodDiscountPercent ? `${venue.foodDiscountPercent}% off your food bill` : "Not available here"}</Text>
      </Pressable>
    </View>
  );

  const details = (
    <View>
      <Section title={t("venue.about")}><T v="body">{venue.description}</T></Section>
      <Section title={t("venue.benefits")}><Bullets items={venue.benefits} /></Section>
      <Section title={t("venue.categories")}>
        <View style={styles.cats}>
          {categories.map((c) => {
            const served = venue.drinkCategories.includes(c.id);
            const inPlan = plan ? plan.drinkCategories.includes(c.id) : true;
            if (!served) return null;
            return (
              <View key={c.id} style={[styles.cat, !inPlan && { opacity: 0.55 }]}>
                <DrinkIcon name={c.icon} size={16} color={C.gold} />
                <Text style={styles.catT}>{c.name}</Text>
                {!inPlan ? <Lock size={12} color={C.muted} /> : null}
              </View>
            );
          })}
        </View>
        {plan ? <T v="caption">Locked categories are not included in your {plan.shortName} package.</T> : null}
      </Section>
      {venue.foodDiscountPercent ? (
        <Section title="Food discount">
          <T v="body">{venue.foodDiscountPercent}% off the food bill for GoSip members.</T>
          {venue.foodExclusions.length ? <T v="small">Exclusions: {venue.foodExclusions.join(" · ")}</T> : null}
        </Section>
      ) : null}
    </View>
  );

  const side = (
    <View>
      <Card style={{ marginTop: isDesktop ? 0 : 22, gap: 12 }}>
        <T v="label">{t("venue.hours")}</T>
        {venue.hours.map((h) => (
          <View key={h.days} style={styles.hourRow}><T v="small">{h.days}</T><T v="bodyStrong" style={{ fontSize: 14 }}>{h.open} – {h.close}</T></View>
        ))}
        <View style={styles.hourRow}><T v="small">{t("venue.memberHours")}</T><T v="small" color={C.gold} style={{ flex: 1, textAlign: "right" }}>{venue.memberHours}</T></View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 }}>
          <Shirt size={16} color={C.gold} /><T v="small" style={{ flex: 1 }}>{t("venue.dress")}: <Text style={{ color: C.ivory }}>{venue.dressCode}</Text></T>
        </View>
      </Card>
      <Section title={t("venue.entry")}><Bullets items={venue.entryRequirements} /></Section>
      <Section title={t("venue.access")}><Bullets items={venue.accessConditions} /></Section>
      <Section title={t("venue.restrictions")}>
        <Bullets items={[...venue.restrictions, ...(tierOk ? [] : [`${TIER_LABEL[venue.tier]} venue — not included in your ${plan?.shortName} package`])]} />
      </Section>
      <Section title={t("venue.contact")}>
        <T v="small">{venue.address}</T>
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <Button label={t("venue.directions")} size="sm" variant="ghost" icon={<Navigation size={14} color={C.gold} />} onPress={openMaps} />
          <Button label={venue.phone} size="sm" variant="ghost" icon={<Phone size={14} color={C.gold} />} onPress={() => Linking.openURL(`tel:${venue.phone.replace(/\s/g, "")}`).catch(() => {})} />
        </View>
      </Section>
      {!active ? (
        <Card tone="gold" style={{ marginTop: 22, gap: 10 }}>
          <T v="bodyStrong">{member ? "Activate a package to redeem here" : "Join GoSip to redeem here"}</T>
          <Button label={member ? "Choose a package" : "Join now"} size="sm" onPress={() => router.push(member ? "/packages" : "/login?mode=signup")} />
        </Card>
      ) : null}
    </View>
  );

  return (
    <Screen edgeToEdge={!isDesktop} testID="venue-screen">
      {gallery}
      <View style={{ paddingHorizontal: isDesktop ? 0 : gutter }}>
        {isDesktop ? (
          <View style={{ flexDirection: "row", gap: 40, marginTop: 8 }}>
            <View style={{ flex: 1.5 }}>{actions}{details}</View>
            <View style={{ flex: 1, marginTop: 18 }}>{side}</View>
          </View>
        ) : (
          <>
            {actions}
            {details}
            {side}
          </>
        )}
        <DemoNotice style={{ marginTop: 26 }} text="Sample venue for demonstration. This listing does not represent a real business or a confirmed GoSip partnership." />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 380, overflow: "hidden", justifyContent: "flex-end" },
  heroTop: { position: "absolute", top: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between" },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(7,19,33,0.6)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.lineSoft },
  heroText: { paddingBottom: 22, gap: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" },
  metaT: { fontFamily: F.semibold, fontSize: 13.5, color: C.ivory, marginRight: 8 },
  action: { flex: 1, backgroundColor: C.ivory, borderRadius: R.lg, padding: 18, alignItems: "center", gap: 6 },
  actionT: { fontFamily: F.bold, fontSize: 15, color: C.ink },
  actionS: { fontFamily: F.body, fontSize: 12, color: C.inkSoft, textAlign: "center" },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cat: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 34, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, backgroundColor: C.goldWash },
  catT: { fontFamily: F.medium, fontSize: 13, color: C.ivory },
  hourRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
});
