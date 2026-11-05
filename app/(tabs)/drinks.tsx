import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { Check, ChevronRight, Clock, Martini } from "lucide-react-native";
import { getDrinkCategory } from "@/gosip/data/drinks";
import { useGoSip, useNow } from "@/gosip/store/GoSipProvider";
import { effectiveStatus } from "@/gosip/store/redemption";
import { C, F, R } from "@/gosip/theme/tokens";
import { formatDate, formatDateTime, formatHoursLeft, msUntilMidnight, prettyCode } from "@/gosip/utils/format";
import { Badge, Button, Card, SectionHeader, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";
import { DrinkIcon } from "@/gosip/ui/DrinkIcon";

export function Ring({ used, total, size = 150 }: { used: number; total: number; size?: number }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = total ? Math.min(1, (total - used) / total) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={7} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.gold} strokeWidth={7} fill="none" strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={{ fontFamily: F.bold, fontSize: size * 0.24, color: C.ivory }}>{total - used}<Text style={{ fontSize: size * 0.13, color: C.muted }}>/{total}</Text></Text>
      <Text style={{ fontFamily: F.medium, fontSize: 11, color: C.muted, letterSpacing: 1 }}>LEFT TODAY</Text>
    </View>
  );
}

export default function MyDrinks() {
  const router = useRouter();
  const { member, plan, state, t, membershipActive, entitlement, venueById, categories } = useGoSip();
  const { isDesktop } = useLayout();
  const now = useNow(1000);
  const active = membershipActive(now);
  const ent = entitlement(now);

  if (!member || !plan || !active || !ent) {
    return (
      <Screen title={isDesktop ? undefined : t("drinks.title")} testID="drinks-screen">
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 36, marginTop: isDesktop ? 40 : 8 }}>
          <Martini size={34} color={C.gold} />
          <T v="h1" center>Two complimentary drinks. Every day.</T>
          <T v="small" center style={{ maxWidth: 420 }}>{member ? "Activate a GoSip package to start redeeming your daily drinks." : "Join GoSip to start redeeming two complimentary drinks every day."}</T>
          <Button label={member ? "Choose a package" : t("common.joinNow")} onPress={() => router.push(member ? "/packages" : "/login?mode=signup")} />
        </Card>
      </Screen>
    );
  }

  const mine = state.redemptions.filter((r) => r.memberId === member.id).sort((a, b) => b.createdAt - a.createdAt);
  const today = mine.filter((r) => r.day === ent.today && ["redeemed", "pending"].includes(effectiveStatus(r, now)));
  const history = mine.filter((r) => effectiveStatus(r, now) === "redeemed").slice(0, 12);
  const slots = Array.from({ length: ent.perDay }).map((_, i) => today[today.length - 1 - i]);

  return (
    <Screen title={isDesktop ? undefined : t("drinks.title")} testID="drinks-screen">
      {isDesktop ? <T v="display" style={{ marginTop: 28, marginBottom: 16 }}>{t("drinks.title")}</T> : null}
      <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
        <Card style={[styles.summary, isDesktop && { flex: 1 }]}>
          <Ring used={ent.redeemedToday + ent.pendingToday} total={ent.perDay} />
          <View style={{ flex: 1, gap: 8, minWidth: 180 }}>
            <T v="label">{t("drinks.entitlement")}</T>
            <T v="h2">{ent.perDay} complimentary drinks per day</T>
            <View style={styles.statRow}>
              <View><Text style={styles.sv} testID="drinks-redeemed">{ent.redeemedToday}</Text><T v="caption">{t("drinks.redeemed")}</T></View>
              <View><Text style={styles.sv}>{ent.pendingToday}</Text><T v="caption">{t("drinks.pending")}</T></View>
              <View><Text style={[styles.sv, { color: C.gold }]} testID="drinks-remaining">{ent.remaining}</Text><T v="caption">{t("drinks.remaining")}</T></View>
            </View>
            <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              <Clock size={13} color={C.muted} />
              <T v="caption">{t("drinks.resets")} · in {formatHoursLeft(msUntilMidnight(now))}</T>
            </View>
          </View>
        </Card>
        <View style={{ gap: 12, flex: isDesktop ? 1 : undefined }}>
          {slots.map((r, i) => {
            const status = r ? effectiveStatus(r, now) : "available";
            const venue = r ? venueById(r.venueId) : undefined;
            const cat = r ? getDrinkCategory(r.categoryId) : undefined;
            return (
              <Pressable
                key={i}
                testID={`drink-slot-${i + 1}`}
                disabled={status !== "pending" && status !== "available"}
                onPress={() => (r && status === "pending" ? router.push({ pathname: "/redeem/[venueId]", params: { venueId: r.venueId, rid: r.id } }) : router.push("/venues"))}
                style={[styles.slot, status === "redeemed" && { backgroundColor: C.ivory }]}
              >
                <View style={[styles.slotNo, status === "redeemed" && { backgroundColor: C.success, borderColor: C.success }]}>
                  {status === "redeemed" ? <Check size={18} color={C.white} /> : <Text style={styles.slotNoT}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotT, status === "redeemed" && { color: C.ink }]}>Drink {i + 1}</Text>
                  <Text style={[styles.slotS, status === "redeemed" && { color: C.inkSoft }]}>
                    {status === "redeemed" && r ? `${cat?.name} · ${venue?.name} · ${formatDateTime(r.redeemedAt ?? r.createdAt)}` : status === "pending" && r ? `Code ${prettyCode(r.code)} issued at ${venue?.name} — tap to show` : "Available. Select a drink at a venue to redeem."}
                  </Text>
                </View>
                <Badge label={status === "redeemed" ? t("drinks.redeemed") : status === "pending" ? t("drinks.pending") : t("drinks.available")} tone={status === "redeemed" ? "success" : status === "pending" ? "solid" : "gold"} />
              </Pressable>
            );
          })}
          <Button testID="find-venue" label={t("drinks.find")} size="lg" full onPress={() => router.push("/venues")} />
        </View>
      </View>

      <View style={{ marginTop: 28, flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
        <Card style={{ flex: 1, gap: 10 }}>
          <T v="label">Eligible drink categories · {plan.shortName}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {categories.map((c) => {
              const ok = plan.drinkCategories.includes(c.id);
              return (
                <View key={c.id} style={[styles.cat, !ok && { opacity: 0.4 }]}>
                  <DrinkIcon name={c.icon} size={14} color={ok ? C.gold : C.muted} />
                  <Text style={styles.catT}>{c.name}</Text>
                </View>
              );
            })}
          </View>
          <T v="caption">Availability depends on each venue's menu and member hours. Alcoholic drinks only for guests of legal drinking age.</T>
        </Card>
        <Card style={{ flex: 1, gap: 6 }}>
          <T v="label">Membership validity</T>
          <T v="h2">{plan.name}</T>
          <T v="small">Active from {member.startDate ? formatDate(member.startDate) : "—"} until {member.expiryDate ? formatDate(member.expiryDate) : "—"}</T>
          <T v="small">Unused daily drinks do not roll over to the next day.</T>
          <Pressable onPress={() => router.push("/usage")} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
            <Text style={{ fontFamily: F.semibold, color: C.gold, fontSize: 13 }}>View my usage</Text>
            <ChevronRight size={14} color={C.gold} />
          </Pressable>
        </Card>
      </View>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title={t("drinks.history")} />
        {history.length ? (
          <Card padded={false}>
            {history.map((r, i) => {
              const venue = venueById(r.venueId);
              const cat = getDrinkCategory(r.categoryId);
              return (
                <View key={r.id} style={[styles.hist, i > 0 && { borderTopWidth: 1, borderTopColor: C.lineSoft }]}>
                  <View style={styles.histIcon}><DrinkIcon name={cat.icon} size={16} color={C.gold} /></View>
                  <View style={{ flex: 1 }}>
                    <T v="bodyStrong" style={{ fontSize: 14 }}>{venue?.name ?? r.venueId}</T>
                    <T v="caption">{cat.name} · {formatDateTime(r.redeemedAt ?? r.createdAt)}</T>
                  </View>
                  <Text style={styles.code}>{prettyCode(r.code)}</Text>
                </View>
              );
            })}
          </Card>
        ) : (
          <T v="small">No redemptions yet.</T>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 20, flexWrap: "wrap" },
  statRow: { flexDirection: "row", gap: 22, marginVertical: 4 },
  sv: { fontFamily: F.bold, fontSize: 22, color: C.ivory },
  slot: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  slotNo: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: C.gold, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },
  slotNoT: { fontFamily: F.bold, fontSize: 16, color: C.gold },
  slotT: { fontFamily: F.semibold, fontSize: 15, color: C.ivory },
  slotS: { fontFamily: F.body, fontSize: 12.5, color: C.muted, marginTop: 2 },
  cat: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 30, borderRadius: 999, borderWidth: 1, borderColor: C.line },
  catT: { fontFamily: F.medium, fontSize: 12, color: C.ivory },
  hist: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  histIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center" },
  code: { fontFamily: F.medium, fontSize: 12, color: C.mutedDim, letterSpacing: 1.2 },
});
