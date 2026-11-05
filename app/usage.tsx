import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getDrinkCategory, DRINK_CATEGORIES } from "@/gosip/data/drinks";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { effectiveStatus } from "@/gosip/store/redemption";
import { C, F, R } from "@/gosip/theme/tokens";
import { DAY, dayKey, formatDateTime } from "@/gosip/utils/format";
import { Card, Chip, DemoNotice, SectionHeader, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";
import { DrinkIcon } from "@/gosip/ui/DrinkIcon";

export default function Usage() {
  const { member, plan, state, venueById, t } = useGoSip();
  const { isDesktop, cols } = useLayout();
  const [range, setRange] = useState<"week" | "month">("week");
  const now = Date.now();
  const days = range === "week" ? 7 : 30;

  const data = useMemo(() => {
    if (!member) return null;
    const since = now - days * DAY;
    const mine = state.redemptions.filter((r) => r.memberId === member.id && effectiveStatus(r, now) === "redeemed" && (r.redeemedAt ?? r.createdAt) >= since);
    const venues = new Set(mine.map((r) => r.venueId));
    const start = member.startDate ? Date.parse(member.startDate) : now;
    const eligibleDays = Math.max(1, Math.min(days, Math.ceil((now - Math.max(start, since)) / DAY) || 1));
    const entitled = eligibleDays * (plan?.drinksPerDay ?? 2);
    const byDay: { key: string; label: string; n: number }[] = [];
    for (let i = Math.min(days, 14) - 1; i >= 0; i--) {
      const ts = now - i * DAY;
      const key = dayKey(ts);
      byDay.push({ key, label: key.slice(8), n: mine.filter((r) => r.day === key).length });
    }
    const byCat = DRINK_CATEGORIES.map((c) => ({ c, n: mine.filter((r) => r.categoryId === c.id).length })).filter((x) => x.n);
    return { mine: mine.sort((a, b) => (b.redeemedAt ?? 0) - (a.redeemedAt ?? 0)), venues: venues.size, entitled, byDay, byCat };
  }, [member, plan, state.redemptions, days, now]);

  if (!member || !data) {
    return <Screen title={t("usage.title")} back><T v="h2" center style={{ marginTop: 40 }}>Sign in to see your usage.</T></Screen>;
  }
  const max = Math.max(2, ...data.byDay.map((d) => d.n));

  return (
    <Screen title={t("usage.title")} back testID="usage-screen">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <Chip testID="range-week" label="This week" active={range === "week"} onPress={() => setRange("week")} />
        <Chip testID="range-month" label="This month" active={range === "month"} onPress={() => setRange("month")} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {[
          { v: String(data.mine.length), l: "Drinks used", id: "u-used" },
          { v: String(Math.max(0, data.entitled - data.mine.length)), l: "Drinks unused", id: "u-left" },
          { v: String(data.venues), l: "Venues visited", id: "u-venues" },
          { v: String(data.mine.length), l: "Benefits redeemed", id: "u-benefits" },
        ].map((s) => (
          <Card key={s.l} style={{ flexGrow: 1, flexBasis: isDesktop ? 0 : "45%", gap: 4 }}>
            <Text style={styles.big} testID={s.id}>{s.v}</Text>
            <T v="small">{s.l}</T>
          </Card>
        ))}
      </View>

      <Card style={{ marginTop: 16 }}>
        <T v="label">Daily redemptions · last {Math.min(days, 14)} days</T>
        <View style={styles.chart}>
          {data.byDay.map((d) => (
            <View key={d.key} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${(d.n / max) * 100}%` }]} />
              </View>
              <Text style={styles.barL}>{d.label}</Text>
            </View>
          ))}
        </View>
        <T v="caption">Maximum {plan?.drinksPerDay ?? 2} complimentary drinks per day.</T>
      </Card>

      <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16, marginTop: 16 }}>
        <Card style={{ flex: 1, gap: 10 }}>
          <T v="label">By category</T>
          {data.byCat.length ? data.byCat.map(({ c, n }) => (
            <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <DrinkIcon name={c.icon} size={16} color={C.gold} />
              <T v="bodyStrong" style={{ flex: 1, fontSize: 14 }}>{c.name}</T>
              <T v="bodyStrong" color={C.gold}>{n}</T>
            </View>
          )) : <T v="small">No redemptions in this period.</T>}
        </Card>
        <View style={{ flex: 1.4 }}>
          <SectionHeader title="Recent activity" />
          <Card padded={false}>
            {data.mine.slice(0, 10).map((r, i) => (
              <View key={r.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.lineSoft }]}>
                <DrinkIcon name={getDrinkCategory(r.categoryId).icon} size={16} color={C.gold} />
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong" style={{ fontSize: 14 }}>{venueById(r.venueId)?.name}</T>
                  <T v="caption">{getDrinkCategory(r.categoryId).name} · {formatDateTime(r.redeemedAt ?? r.createdAt)}</T>
                </View>
              </View>
            ))}
            {!data.mine.length ? <T v="small" style={{ padding: 16 }}>No activity yet.</T> : null}
          </Card>
        </View>
      </View>
      <DemoNotice style={{ marginTop: 18 }} text="Statistics are calculated from redemption records stored on this device (including seeded sample history). No savings values are shown because menu prices are not verified." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: F.bold, fontSize: 30, color: C.ivory },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 150, gap: 6, marginVertical: 14 },
  barCol: { flex: 1, alignItems: "center", gap: 6, height: "100%" },
  barTrack: { flex: 1, width: "70%", maxWidth: 26, justifyContent: "flex-end", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 6, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: C.gold, borderRadius: 6 },
  barL: { fontFamily: F.body, fontSize: 10, color: C.mutedDim },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
});
