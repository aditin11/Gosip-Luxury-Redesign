import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Building2, ChevronDown, Hotel, MapPin, Martini, Percent, Search, Sparkles, UtensilsCrossed, Waves, Sofa } from "lucide-react-native";
import { BRAND, FOOD_DISCOUNT } from "@/gosip/config/brand";
import { EXPERIENCES } from "@/gosip/data/offers";
import { getCity } from "@/gosip/data/locations";
import type { VenueType } from "@/gosip/data/venues";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { intro } from "@/gosip/session";
import { C, F, R } from "@/gosip/theme/tokens";
import { formatDate } from "@/gosip/utils/format";
import { DubaiSkyline, GoSipLogo } from "@/gosip/ui/Brand";
import { Photo, VenueCard } from "@/gosip/ui/Media";
import { Badge, Button, Grid, SectionHeader, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

const MOODS: { type: VenueType; label: string; Icon: typeof Martini }[] = [
  { type: "restaurant", label: "Restaurants", Icon: UtensilsCrossed },
  { type: "bar", label: "Bars", Icon: Martini },
  { type: "lounge", label: "Lounges", Icon: Sofa },
  { type: "hotel", label: "Hotels", Icon: Hotel },
  { type: "beachClub", label: "Beach clubs", Icon: Waves },
  { type: "experience", label: "Experiences", Icon: Sparkles },
];

function greetingKey(now: number) {
  const h = new Date(now + 4 * 3_600_000).getUTCHours();
  return h < 12 ? "home.greeting.morning" : h < 17 ? "home.greeting.afternoon" : "home.greeting.evening";
}

export default function Home() {
  const router = useRouter();
  const { state, member, plan, t, membershipActive, entitlement, country, isRTL } = useGoSip();
  const { isDesktop, isTablet, cols, gutter } = useLayout();
  if (!intro.shown && !state.session) return <Redirect href="/splash" />;

  const now = Date.now();
  const active = membershipActive(now);
  const ent = entitlement(now);
  const cityInfo = getCity(state.settings.cityId);
  const cityName = cityInfo?.city.name ?? "Dubai";
  const live = state.venues.filter((v) => v.active);
  const featured = live.filter((v) => v.featured);
  const inCity = live.filter((v) => v.cityId === state.settings.cityId);
  const recommended = (inCity.length ? inCity : live).filter((v) => !v.featured).slice(0, isDesktop ? 4 : 4);
  const firstName = member?.name.split(" ")[0];

  const openVenues = (params?: Record<string, string>) => router.push({ pathname: "/venues", params });

  const header = !isDesktop ? (
    <View style={[styles.mHeader, isRTL && { flexDirection: "row-reverse" }]}>
      <GoSipLogo size={24} align="flex-start" />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={() => router.push("/offers")} style={styles.iconBtn} accessibilityLabel="Notifications and offers" testID="notifications">
          <Bell size={18} color={C.ivory} />
          <View style={styles.bellDot} />
        </Pressable>
        <Pressable onPress={() => router.push("/profile")} style={[styles.iconBtn, { borderColor: C.gold }]} accessibilityLabel="Profile">
          <Text style={styles.avatarText}>{member?.avatarInitials ?? "GS"}</Text>
        </Pressable>
      </View>
    </View>
  ) : null;

  const statusCard = (
    <LinearGradient colors={["#18304C", "#0E1E31", "#2B2213"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.status, !isTablet && { flexDirection: "column", alignItems: "stretch" }]} testID="membership-status">
      <View style={{ flex: isTablet ? 1 : undefined, gap: 6 }}>
        <T v="label">{active && plan ? `${plan.shortName} package · Active` : "Membership"}</T>
        {active && plan && ent ? (
          <>
            <T v="h1" style={{ fontSize: isDesktop ? 30 : 24 }}>{ent.remaining} of {ent.perDay} {t("home.drinksLeft")}</T>
            <T v="small" color={C.ivoryDim}>Valid until {member?.expiryDate ? formatDate(member.expiryDate) : "—"} · resets at midnight Dubai time</T>
          </>
        ) : (
          <>
            <T v="h1" style={{ fontSize: isDesktop ? 28 : 22 }}>Enjoy 2 drinks. Every day.</T>
            <T v="small" color={C.ivoryDim}>{t("home.noPlan")}</T>
          </>
        )}
      </View>
      {active && ent ? (
        <View style={styles.glasses}>
          {Array.from({ length: ent.perDay }).map((_, i) => {
            const used = i < ent.redeemedToday + ent.pendingToday;
            return (
              <View key={i} style={[styles.glass, used && { opacity: 0.35 }]}>
                <Martini size={22} color={used ? C.muted : C.gold} />
              </View>
            );
          })}
          <Button label={t("drinks.find")} size="sm" onPress={() => openVenues()} />
        </View>
      ) : (
        <Button testID="home-choose-plan" label={t("home.choosePlan")} size="sm" onPress={() => router.push("/packages")} />
      )}
    </LinearGradient>
  );

  const search = (
    <Pressable testID="home-search" onPress={() => openVenues({ focus: "1" })} style={[styles.search, isRTL && { flexDirection: "row-reverse" }]} accessibilityRole="search">
      <Search size={18} color={C.muted} />
      <Text style={styles.searchText}>{t("home.search")}</Text>
      <View style={styles.cityPill}>
        <MapPin size={13} color={C.gold} />
        <Text style={styles.cityText}>{cityName}</Text>
        <ChevronDown size={13} color={C.gold} />
      </View>
    </Pressable>
  );

  return (
    <Screen testID="home-screen">
      {header}
      {/* Hero */}
      <View style={[styles.hero, isDesktop && { height: 420, marginTop: 24 }]}>
        <Photo imageKey="loungeCocktails" style={StyleSheet.absoluteFill} overlay={false} />
        <LinearGradient
          colors={isDesktop ? ["rgba(7,19,33,0.96)", "rgba(7,19,33,0.75)", "rgba(7,19,33,0.1)"] : ["rgba(7,19,33,0.2)", "rgba(7,19,33,0.55)", "rgba(7,19,33,0.95)"]}
          start={isDesktop ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
          end={isDesktop ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroSky}><DubaiSkyline height={isDesktop ? 120 : 80} color="rgba(7,19,33,0.85)" windows={false} /></View>
        <View style={[styles.heroText, isDesktop && { maxWidth: 560, padding: 44, justifyContent: "center", top: 0 }]}>
          <T v="label">{firstName ? `${t(greetingKey(now) as any)}, ${firstName}` : t("onb.welcome")}</T>
          <T v="hero" style={[{ marginTop: 10 }, !isDesktop && { fontSize: 34, lineHeight: 40 }]}>
            2 drinks.{"\n"}<Text style={{ color: C.gold }}>Every day.</Text>
          </T>
          <T v="body" color={C.ivoryDim} style={{ marginTop: 10, maxWidth: 440 }}>Across the best bars, restaurants, lounges and hotels in the UAE.</T>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <Button label="Explore venues" onPress={() => openVenues()} size={isDesktop ? "md" : "sm"} />
            <Button label="See packages" variant="ivory" onPress={() => router.push("/packages")} size={isDesktop ? "md" : "sm"} />
          </View>
        </View>
      </View>

      <View style={{ marginTop: 18, gap: 14 }}>
        {statusCard}
        {search}
      </View>

      {/* Moods */}
      <View style={{ marginTop: 32 }}>
        <SectionHeader title={t("home.categories")} eyebrow="Restaurants · Bars · Lounges · Hotels" />
        <Grid cols={cols(3, 6, 6)} gap={12}>
          {MOODS.map((m) => {
            const count = live.filter((v) => v.type === m.type).length;
            return (
              <Pressable key={m.type} testID={`mood-${m.type}`} onPress={() => openVenues({ type: m.type })} style={({ hovered }: any) => [styles.mood, hovered && { borderColor: C.gold }]}>
                <View style={styles.moodIcon}><m.Icon size={22} color={C.gold} /></View>
                <Text style={styles.moodLabel} numberOfLines={1}>{m.label}</Text>
                <Text style={styles.moodCount}>{count} venues</Text>
              </Pressable>
            );
          })}
        </Grid>
      </View>

      {/* Featured */}
      <View style={{ marginTop: 20 }}>
        <SectionHeader title={t("home.featured")} action={t("common.seeAll")} onAction={() => openVenues()} eyebrow="Curated by GoSip" />
        {isTablet ? (
          <Grid cols={cols(1, 2, 3)}>
            {featured.slice(0, isDesktop ? 6 : 4).map((v) => <VenueCard key={v.id} venue={v} variant="wide" testID={`featured-${v.id}`} />)}
          </Grid>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -gutter }} contentContainerStyle={{ paddingHorizontal: gutter, gap: 12 }}>
            {featured.map((v) => (
              <View key={v.id} style={{ width: 250 }}>
                <VenueCard venue={v} testID={`featured-${v.id}`} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Food discount band */}
      <Pressable onPress={() => router.push("/offers")} style={[styles.food, isDesktop && { height: 200 }]} testID="food-band">
        <Photo imageKey="foodSignature" style={[StyleSheet.absoluteFill]} overlay={false} />
        <LinearGradient colors={["rgba(7,19,33,0.25)", "rgba(7,19,33,0.92)"]} start={{ x: 0, y: 0.5 }} end={{ x: 0.6, y: 0.5 }} style={StyleSheet.absoluteFill} />
        <View style={[styles.foodText, isRTL ? { left: 20 } : { right: 20 }]}>
          <View style={styles.foodIcon}><Percent size={20} color={C.gold} /></View>
          <Text style={styles.foodBig}>{FOOD_DISCOUNT.defaultPercent}% OFF FOOD</Text>
          <T v="small" color={C.ivoryDim}>For all GoSip members at participating venues</T>
        </View>
      </Pressable>

      {/* Explore across UAE */}
      <View style={{ marginTop: 32 }}>
        <SectionHeader title={t("home.explore")} eyebrow={country.name} />
        <View style={styles.cities}>
          {country.cities.map((c) => {
            const n = live.filter((v) => v.cityId === c.id).length;
            return (
              <Pressable key={c.id} testID={`city-${c.id}`} onPress={() => openVenues({ city: c.id })} style={({ hovered }: any) => [styles.city, hovered && { borderColor: C.gold }]}>
                <Building2 size={16} color={C.gold} />
                <View>
                  <Text style={styles.cityName}>{c.name}</Text>
                  <Text style={styles.moodCount}>{n ? `${n} venues` : "Coming soon"}</Text>
                </View>
              </Pressable>
            );
          })}
          <Pressable onPress={() => openVenues({ country: "qatar" })} style={[styles.city, { borderStyle: "dashed" }]}>
            <Sparkles size={16} color={C.muted} />
            <View>
              <Text style={[styles.cityName, { color: C.muted }]}>Qatar & Kuwait</Text>
              <Text style={styles.moodCount}>Launching next</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Experiences */}
      <View style={{ marginTop: 32 }}>
        <SectionHeader title={t("home.experiences")} action={t("common.seeAll")} onAction={() => router.push("/offers")} eyebrow="Exclusive offers & member events" />
        <Grid cols={cols(1, 2, 3)}>
          {EXPERIENCES.slice(0, 3).map((e) => {
            const venue = state.venues.find((v) => v.id === e.venueId);
            return (
              <Pressable key={e.id} onPress={() => router.push({ pathname: "/venue/[id]", params: { id: e.venueId } })} style={styles.exp}>
                <Photo imageKey={e.imageKey} style={{ height: 160 }}>
                  <View style={{ padding: 14, gap: 6 }}>
                    <Badge label={e.kind === "event" ? "Member event" : e.kind === "offer" ? "Special offer" : "Experience"} tone="solid" />
                    <T v="h2">{e.title}</T>
                  </View>
                </Photo>
                <View style={{ padding: 14, gap: 4 }}>
                  <T v="small" color={C.gold}>{e.dateLabel}</T>
                  <T v="small" numberOfLines={2}>{venue?.name} · {e.description}</T>
                </View>
              </Pressable>
            );
          })}
        </Grid>
      </View>

      {/* Recommended */}
      <View style={{ marginTop: 16 }}>
        <SectionHeader title={t("home.recommended")} eyebrow={`Near ${cityName}`} action={t("common.seeAll")} onAction={() => openVenues({ city: state.settings.cityId })} />
        <Grid cols={cols(1, 2, 2)} gap={12}>
          {recommended.map((v) => <VenueCard key={v.id} venue={v} variant="row" />)}
        </Grid>
      </View>

      {/* Footer brand */}
      <View style={styles.footer}>
        <DubaiSkyline height={90} color="#0E2034" />
        <View style={{ alignItems: "center", gap: 8, paddingVertical: 22 }}>
          <GoSipLogo size={26} />
          <T v="small" center>{BRAND.motto}</T>
          <View style={{ flexDirection: "row", gap: 18, marginTop: 6 }}>
            <Pressable onPress={() => router.push("/staff")}><Text style={styles.footLink}>Venue staff portal</Text></Pressable>
            <Pressable onPress={() => router.push("/admin")}><Text style={styles.footLink}>Admin dashboard</Text></Pressable>
            <Pressable onPress={() => router.push("/modal")}><Text style={styles.footLink}>About this demo</Text></Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.lineSoft, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)" },
  bellDot: { position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: C.gold },
  avatarText: { fontFamily: F.bold, fontSize: 12, color: C.gold },
  hero: { height: 330, borderRadius: R.xl, overflow: "hidden", borderWidth: 1, borderColor: C.line },
  heroSky: { position: "absolute", left: 0, right: 0, bottom: 0 },
  heroText: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 22 },
  status: { borderRadius: R.lg, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1, borderColor: C.line, flexWrap: "wrap" },
  glasses: { flexDirection: "row", alignItems: "center", gap: 10 },
  glass: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },
  search: { flexDirection: "row", alignItems: "center", gap: 12, height: 54, borderRadius: R.pill, paddingHorizontal: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  searchText: { flex: 1, fontFamily: F.body, fontSize: 14, color: C.mutedDim },
  cityPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, height: 30, borderRadius: R.pill, backgroundColor: C.goldWash },
  cityText: { fontFamily: F.semibold, fontSize: 12, color: C.gold },
  mood: { borderRadius: R.lg, padding: 12, gap: 6, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft, alignItems: "flex-start" },
  moodIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  moodLabel: { fontFamily: F.semibold, fontSize: 12.5, color: C.ivory },
  moodCount: { fontFamily: F.body, fontSize: 11.5, color: C.mutedDim },
  food: { height: 150, borderRadius: R.lg, overflow: "hidden", marginTop: 16, borderWidth: 1, borderColor: C.line },
  foodText: { position: "absolute", top: 0, bottom: 0, justifyContent: "center", alignItems: "flex-end", gap: 6, maxWidth: "60%" },
  foodIcon: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: C.gold, alignItems: "center", justifyContent: "center" },
  foodBig: { fontFamily: F.bold, fontSize: 26, color: C.gold, letterSpacing: 0.5, textAlign: "right" },
  cities: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  city: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  cityName: { fontFamily: F.semibold, fontSize: 14, color: C.ivory },
  exp: { borderRadius: R.lg, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: C.lineSoft },
  footLink: { fontFamily: F.medium, fontSize: 12.5, color: C.gold },
});
