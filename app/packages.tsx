import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Check, CheckCircle2, Minus } from "lucide-react-native";
import { TIER_LABEL, type MembershipPlan, type PlanId } from "@/gosip/config/plans";
import { DRINK_CATEGORIES } from "@/gosip/data/drinks";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { formatDate, formatMoney } from "@/gosip/utils/format";
import { Photo } from "@/gosip/ui/Media";
import { Badge, Button, Card, DemoNotice, Divider, SectionHeader, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

const ACCENT: Record<MembershipPlan["accent"], [string, string]> = {
  teal: ["#1A5A78", "#0C2638"],
  navy: ["#1D2738", "#0B111C"],
  gold: ["#6A4C1C", "#2A1D0A"],
};

export function PlanCard({ plan, selected, current, onPress }: { plan: MembershipPlan; selected?: boolean; current?: boolean; onPress?: () => void }) {
  return (
    <Pressable testID={`plan-${plan.id}`} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: !!selected }} style={({ hovered }: any) => [styles.plan, selected && styles.planSelected, hovered && !selected && { borderColor: C.bronze }]}>
      <LinearGradient colors={ACCENT[plan.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.planHead}>
        <Photo imageKey={plan.imageKey} overlay={false} style={styles.planPhoto} />
        <LinearGradient colors={[ACCENT[plan.accent][0] + "F2", ACCENT[plan.accent][0] + "99", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        <View style={{ padding: 18, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <T v="h2" style={{ fontFamily: F.bold }}>{plan.name}</T>
            {current ? <Badge label="Current" tone="success" /> : plan.recommended ? <Badge label="Most popular" tone="solid" /> : null}
          </View>
          <T v="small" color={C.ivoryDim}>{plan.durationLabel}</T>
          <Text style={styles.price}>{formatMoney(plan.priceAED, "AED")}</Text>
          <T v="caption" color={C.ivoryDim}>{plan.vatInclusive ? "VAT inclusive" : "Excl. VAT"}</T>
        </View>
        {selected ? <View style={styles.tick}><CheckCircle2 size={26} color={C.gold} fill={C.midnight} /></View> : null}
      </LinearGradient>
      <View style={styles.planBody}>
        <T v="small" color={C.ink} style={{ fontFamily: F.medium }}>{plan.summary}</T>
        <View style={{ gap: 6, marginTop: 10 }}>
          {plan.highlights.map((h) => (
            <View key={h} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <Check size={14} color={C.bronze} style={{ marginTop: 2 }} />
              <T v="small" color={C.inkSoft} style={{ flex: 1 }}>{h}</T>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function Yes({ on }: { on: boolean }) {
  return on ? <Check size={16} color={C.gold} /> : <Minus size={16} color={C.mutedDim} />;
}

export default function Packages() {
  const router = useRouter();
  const { state, dispatch, member, plan: currentPlan, t, membershipActive } = useGoSip();
  const { isDesktop, cols } = useLayout();
  const selectedId = state.pendingPlanId;
  const selected = state.plans.find((p) => p.id === selectedId);

  const choose = (id: PlanId) => dispatch({ type: "SET_PENDING_PLAN", planId: id });
  const proceed = () => {
    if (!selected) return;
    if (!member) router.push("/login?mode=signup&next=checkout");
    else router.push("/checkout");
  };

  const compareRows: { label: string; render: (p: MembershipPlan) => React.ReactNode }[] = [
    { label: "Duration", render: (p) => p.durationLabel },
    { label: "Price (AED)", render: (p) => `${formatMoney(p.priceAED)}${p.vatInclusive ? " incl. VAT" : ""}` },
    { label: "Complimentary drinks", render: (p) => `${p.drinksPerDay} per day` },
    ...DRINK_CATEGORIES.map((c) => ({ label: c.name, render: (p: MembershipPlan) => <Yes on={p.drinkCategories.includes(c.id)} /> })),
    { label: "Venue eligibility", render: (p) => p.venueTiers.map((x) => TIER_LABEL[x]).join(", ") },
    { label: "Food discount", render: (p) => `${p.foodDiscountPercent}%` },
    { label: "Venue allocation limit", render: (p) => `${formatMoney(p.venueAllocationAED)} / day` },
  ];

  return (
    <Screen title={t("packages.title")} back testID="packages-screen">
      {member && currentPlan && membershipActive() ? (
        <Card style={{ marginBottom: 16 }} tone="gold">
          <T v="label">Your membership</T>
          <T v="h2" style={{ marginTop: 6 }}>{currentPlan.name}</T>
          <T v="small">Valid to {member.expiryDate ? formatDate(member.expiryDate) : "—"}</T>
        </Card>
      ) : null}
      <DemoNotice text="Demonstration prices — package names, prices and benefits are configurable in src/gosip/config/plans.ts and must be confirmed before launch." style={{ marginBottom: 16 }} />

      <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
        {state.plans.map((p) => (
          <View key={p.id} style={{ flex: isDesktop ? 1 : undefined }}>
            <PlanCard plan={p} selected={selectedId === p.id} current={currentPlan?.id === p.id && membershipActive()} onPress={() => choose(p.id)} />
          </View>
        ))}
      </View>

      {/* Subscription summary */}
      <Card style={{ marginTop: 20 }} tone="raised">
        {selected ? (
          <View style={{ gap: 10 }}>
            <T v="label">Subscription summary</T>
            <View style={styles.sumRow}><T v="bodyStrong">{selected.name}</T><T v="bodyStrong" color={C.gold}>{formatMoney(selected.priceAED)}</T></View>
            <T v="small">{selected.durationLabel} · {selected.drinksPerDay} complimentary drinks per day · {selected.foodDiscountPercent}% off food · {selected.venueTiers.map((x) => TIER_LABEL[x]).join(" & ")} venues</T>
            <Divider />
            {selected.restrictions.map((r) => <T key={r} v="small">• {r}</T>)}
            <Button testID="continue-plan" label={`${t("common.continue")} · ${formatMoney(selected.priceAED)}`} size="lg" full onPress={proceed} style={{ marginTop: 6 }} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <T v="bodyStrong">{t("packages.select")}</T>
            <T v="small">Tap a package above to see your subscription summary.</T>
            <Button label={t("packages.select")} size="lg" full disabled />
          </View>
        )}
        <Pressable onPress={() => router.push("/venues")} style={{ alignSelf: "center", marginTop: 12 }}>
          <Text style={styles.link}>Browse venues first</Text>
        </Pressable>
      </Card>

      {/* Comparison */}
      <View style={{ marginTop: 32 }}>
        <SectionHeader title={t("packages.compare")} eyebrow="Side by side" />
        <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, { minWidth: isDesktop ? undefined : 560, width: isDesktop ? "100%" : undefined }]}>
            <View style={[styles.tr, styles.thead]}>
              <Text style={[styles.th, { flex: 1.4 }]}> </Text>
              {state.plans.map((p) => <Text key={p.id} style={styles.th}>{p.shortName}</Text>)}
            </View>
            {compareRows.map((row, i) => (
              <View key={row.label} style={[styles.tr, i % 2 === 1 && { backgroundColor: "rgba(255,255,255,0.02)" }]}>
                <Text style={[styles.tdLabel, { flex: 1.4 }]}>{row.label}</Text>
                {state.plans.map((p) => {
                  const v = row.render(p);
                  return (
                    <View key={p.id} style={styles.td}>
                      {typeof v === "string" ? <Text style={styles.tdText}>{v}</Text> : v}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        <T v="caption" style={{ marginTop: 10 }}>
          Membership restrictions: drinks are complimentary per eligible membership day (Dubai time), subject to venue member hours, venue availability and legal drinking age. Benefits cannot be combined with other offers.
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: { borderRadius: R.lg, overflow: "hidden", borderWidth: 1.5, borderColor: "transparent", backgroundColor: C.ivory },
  planSelected: { borderColor: C.gold },
  planHead: { minHeight: 132, justifyContent: "center" },
  planPhoto: { position: "absolute", right: 0, top: 0, bottom: 0, width: "55%" },
  price: { fontFamily: F.bold, fontSize: 30, color: C.gold, marginTop: 8, letterSpacing: -0.5 },
  tick: { position: "absolute", top: 14, right: 14 },
  planBody: { padding: 16, backgroundColor: C.ivory },
  sumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  link: { fontFamily: F.semibold, color: C.gold, fontSize: 13.5 },
  table: { borderRadius: R.lg, borderWidth: 1, borderColor: C.lineSoft, overflow: "hidden", backgroundColor: C.card },
  thead: { backgroundColor: C.cardRaised },
  tr: { flexDirection: "row", alignItems: "center", minHeight: 46, paddingHorizontal: 14 },
  th: { flex: 1, fontFamily: F.bold, color: C.gold, fontSize: 13, textAlign: "center", letterSpacing: 0.6 },
  tdLabel: { fontFamily: F.medium, color: C.ivoryDim, fontSize: 13 },
  td: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  tdText: { fontFamily: F.body, color: C.ivory, fontSize: 12.5, textAlign: "center" },
});
