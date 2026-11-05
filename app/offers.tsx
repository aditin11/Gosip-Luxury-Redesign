import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Percent, Ticket } from "lucide-react-native";
import { FOOD_DISCOUNT } from "@/gosip/config/brand";
import { EXPERIENCES } from "@/gosip/data/offers";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { Photo, VenueCard } from "@/gosip/ui/Media";
import { Badge, Card, DemoNotice, Grid, SectionHeader, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function Offers() {
  const router = useRouter();
  const { state, plan, member, t } = useGoSip();
  const { cols, isDesktop } = useLayout();
  const eligible = state.venues.filter((v) => v.active && v.foodDiscountPercent > 0);
  const validity = member?.expiryDate && plan ? `Valid for your ${plan.name} membership period` : "Valid for the duration of any active GoSip membership";

  return (
    <Screen title={t("offers.title")} back testID="offers-screen">
      <View style={[styles.hero, isDesktop && { height: 280 }]}>
        <Photo imageKey="foodSignature" style={StyleSheet.absoluteFill} overlay={false} />
        <LinearGradient colors={["rgba(7,19,33,0.95)", "rgba(7,19,33,0.6)", "rgba(7,19,33,0.2)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        <View style={{ padding: isDesktop ? 40 : 22, gap: 8, maxWidth: 520 }}>
          <View style={styles.pct}><Percent size={20} color={C.gold} /></View>
          <Text style={[styles.big, !isDesktop && { fontSize: 30 }]}>{FOOD_DISCOUNT.defaultPercent}% OFF FOOD</Text>
          <T v="body" color={C.ivoryDim}>For all GoSip members at participating venues. Great food completes the experience.</T>
        </View>
      </View>

      <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16, marginTop: 16 }}>
        <Card style={{ flex: 1, gap: 8 }}>
          <T v="label">Member conditions</T>
          {FOOD_DISCOUNT.conditions.map((c) => <T key={c} v="small">• {c}</T>)}
          <T v="small" color={C.gold} style={{ marginTop: 4 }}>{validity}</T>
        </Card>
        <Card style={{ flex: 1, gap: 8 }}>
          <T v="label">Exclusions</T>
          {FOOD_DISCOUNT.exclusions.map((c) => <T key={c} v="small">• {c}</T>)}
          <T v="caption">Venue-specific exclusions are listed on each venue page.</T>
        </Card>
      </View>

      <View style={{ marginTop: 30 }}>
        <SectionHeader title="Exclusive experiences & offers" eyebrow="Member events · Special offers · Curated experiences" />
        <Grid cols={cols(1, 2, 3)}>
          {EXPERIENCES.map((e) => {
            const venue = state.venues.find((v) => v.id === e.venueId);
            const included = plan ? e.plans.includes(plan.id) : false;
            return (
              <Pressable key={e.id} testID={`exp-${e.id}`} onPress={() => router.push({ pathname: "/venue/[id]", params: { id: e.venueId } })} style={styles.exp}>
                <Photo imageKey={e.imageKey} style={{ height: 150 }}>
                  <View style={{ padding: 12, flexDirection: "row", gap: 6 }}>
                    <Badge label={e.kind === "event" ? "Premium member event" : e.kind === "offer" ? "Special offer" : "Curated experience"} tone="solid" />
                  </View>
                </Photo>
                <View style={{ padding: 14, gap: 6 }}>
                  <T v="h3">{e.title}</T>
                  <T v="small" color={C.gold}>{e.dateLabel} · {venue?.name}</T>
                  <T v="small">{e.description}</T>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                    <Ticket size={13} color={C.muted} />
                    <T v="caption">{e.plans.map((p) => p[0].toUpperCase() + p.slice(1)).join(" · ")}{e.seatsLabel ? ` · ${e.seatsLabel}` : ""}</T>
                    {plan ? <Badge label={included ? "Included in your plan" : "Upgrade to access"} tone={included ? "success" : "muted"} /> : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </Grid>
      </View>

      <View style={{ marginTop: 16 }}>
        <SectionHeader title="Eligible venues for food discount" eyebrow={`${eligible.length} venues`} />
        <Grid cols={cols(1, 2, 2)} gap={12}>
          {eligible.map((v) => <VenueCard key={v.id} venue={v} variant="row" />)}
        </Grid>
      </View>
      <DemoNotice style={{ marginTop: 18 }} text={`The food-discount percentage is configurable (currently ${FOOD_DISCOUNT.defaultPercent}%). Offers and experiences are sample content.`} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, borderRadius: R.xl, overflow: "hidden", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  pct: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: C.gold, alignItems: "center", justifyContent: "center" },
  big: { fontFamily: F.bold, fontSize: 40, color: C.gold, letterSpacing: 0.5 },
  exp: { borderRadius: R.lg, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
});
