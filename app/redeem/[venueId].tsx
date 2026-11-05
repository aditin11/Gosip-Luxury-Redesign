import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, CircleCheck, Hourglass, Lock, ShieldCheck, Store, TriangleAlert } from "lucide-react-native";
import { BRAND } from "@/gosip/config/brand";
import { getDrinkCategory, type DrinkCategoryId } from "@/gosip/data/drinks";
import { useGoSip, useNow } from "@/gosip/store/GoSipProvider";
import { effectiveStatus } from "@/gosip/store/redemption";
import { C, F, R } from "@/gosip/theme/tokens";
import { formatCountdown, formatDateTime, prettyCode } from "@/gosip/utils/format";
import { Badge, Button, Card, DemoNotice, Divider, T } from "@/gosip/ui/primitives";
import { SAMPLE_VENUES } from "@/gosip/data/venues";
import { Screen } from "@/gosip/ui/Shell";
import { DrinkIcon } from "@/gosip/ui/DrinkIcon";

/** Pre-render sample venues for the static web export (admin-added venues still work via in-app navigation). */
export async function generateStaticParams(): Promise<{ venueId: string }[]> {
  return SAMPLE_VENUES.map((v) => ({ venueId: v.id }));
}

export default function Redeem() {
  const params = useLocalSearchParams<{ venueId: string; rid?: string }>();
  const venueId = params.venueId;
  const router = useRouter();
  const { venueById, plan, member, state, issueCode, dispatch, t, categories, membershipActive, entitlement, hydrated } = useGoSip();
  const rid = hydrated ? params.rid : undefined;
  const now = useNow(1000);
  const [error, setError] = useState<string | null>(null);
  const venue = venueById(String(venueId));
  const record = rid ? state.redemptions.find((r) => r.id === rid) : undefined;
  const existing = !record && member ? state.redemptions.find((r) => r.memberId === member.id && r.venueId === venueId && effectiveStatus(r, now) === "pending") : undefined;
  const ent = entitlement(now);

  if (!venue) {
    return <Screen title="Redeem" back><T v="h2" center style={{ marginTop: 40 }}>Venue not found</T></Screen>;
  }

  // ── Not eligible to redeem ────────────────────────────────────────────────
  if (!member || !membershipActive(now)) {
    return (
      <Screen title={t("redeem.select")} back testID="redeem-locked" maxWidth={640}>
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 30, marginTop: 12 }}>
          <Lock size={30} color={C.gold} />
          <T v="h2" center>{member ? "Activate a package to redeem" : "Join GoSip to redeem drinks"}</T>
          <T v="small" center>Members enjoy two complimentary drinks every day at venues like {venue.name}.</T>
          <Button label={member ? "Choose a package" : t("common.joinNow")} onPress={() => router.push(member ? "/packages" : "/login?mode=signup")} />
        </Card>
      </Screen>
    );
  }

  // ── Code view ─────────────────────────────────────────────────────────────
  if (record) {
    const status = effectiveStatus(record, now);
    const cat = getDrinkCategory(record.categoryId);
    if (status === "redeemed") {
      return (
        <Screen testID="redeem-success" maxWidth={560}>
          <View style={styles.successWrap}>
            <View style={styles.burst}><CircleCheck size={56} color={C.gold} /></View>
            <T v="display" center>{t("redeem.success")}</T>
            <T v="body" center>Your drink has been successfully redeemed at {venue.name}.</T>
            <Card style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 14 }}>
              <DrinkIcon name={cat.icon} size={30} color={C.gold} />
              <View style={{ flex: 1 }}>
                <T v="h3">{cat.name}</T>
                <T v="small">{record.redeemedAt ? formatDateTime(record.redeemedAt) : ""} · Code {prettyCode(record.code)}</T>
              </View>
            </Card>
            <T v="h3" center color={C.gold} style={{ marginTop: 4 }}>Enjoy your drink!</T>
            {ent ? <T v="small" center>{ent.remaining} of {ent.perDay} drinks left today</T> : null}
            <Button testID="redeem-done" label={t("common.done")} size="lg" full onPress={() => router.replace("/drinks")} />
          </View>
        </Screen>
      );
    }
    const left = record.expiresAt - now;
    return (
      <Screen title={t("redeem.show")} back testID="redeem-code" maxWidth={560}>
        <T v="display" style={{ marginTop: 4 }}>{venue.name}</T>
        <T v="small">{cat.name} · {cat.description}</T>
        <View style={styles.codeCard}>
          <T v="label" center color={C.bronze}>Your redemption code</T>
          <View style={styles.codeRow} accessible accessibilityLabel={`Code ${record.code.split("").join(" ")}`} testID="redemption-code">
            {record.code.split("").map((ch, i) => (
              <React.Fragment key={i}>
                {i === 3 ? <Text style={styles.codeDash}>–</Text> : null}
                <View style={styles.codeBox}><Text style={styles.codeChar}>{ch}</Text></View>
              </React.Fragment>
            ))}
          </View>
          <Divider style={{ backgroundColor: "rgba(20,27,38,0.1)", marginVertical: 14 }} />
          <View style={styles.kv}><Text style={styles.k}>Venue</Text><Text style={styles.v}>{venue.name}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Benefit</Text><Text style={styles.v}>1 complimentary {cat.name.toLowerCase().replace(/s$/, "")}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Issued</Text><Text style={styles.v}>{formatDateTime(record.createdAt)}</Text></View>
          <View style={styles.kv}><Text style={styles.k}>Status</Text>
            <Text style={[styles.v, { color: status === "pending" ? C.bronze : C.danger }]} testID="code-status">
              {status === "pending" ? t("redeem.waiting") : status === "expired" ? "Expired" : "Cancelled"}
            </Text>
          </View>
        </View>
        <View style={styles.expiry}>
          <Hourglass size={16} color={status === "pending" ? C.gold : C.danger} />
          <T v="bodyStrong" style={{ flex: 1 }} testID="code-expiry">{status === "pending" ? `${t("redeem.expires")} ${formatCountdown(left)}` : status === "expired" ? "This code has expired" : "This code was cancelled"}</T>
          <Badge label={t("redeem.singleUse")} tone="muted" />
        </View>
        <T v="small" style={{ marginTop: 10 }}>
          Show this code to the venue team. Staff enter it in the GoSip venue portal to confirm your drink. The code is valid only at {venue.name}, for this drink, once. {cat.ageRestricted ? BRAND.legalAgeNotice : ""}
        </T>
        <View style={{ gap: 10, marginTop: 18 }}>
          {status === "pending" ? (
            <>
              {Platform.OS === "web" ? (
                <Button
                  testID="open-staff"
                  label="Demo: open venue staff portal in a new tab"
                  variant="outline"
                  full
                  icon={<Store size={16} color={C.gold} />}
                  onPress={() => (globalThis as any).open?.(`/staff`, "_blank")}
                />
              ) : (
                <Button label="Demo: open venue staff portal" variant="outline" full onPress={() => router.push("/staff")} />
              )}
              <Button testID="cancel-code" label={t("redeem.cancelCode")} variant="danger" full onPress={() => { dispatch({ type: "CANCEL_CODE", id: record.id }); router.replace({ pathname: "/redeem/[venueId]", params: { venueId: venue.id } }); }} />
            </>
          ) : (
            <Button label="Generate a new code" full onPress={() => router.replace({ pathname: "/redeem/[venueId]", params: { venueId: venue.id } })} />
          )}
        </View>
        <DemoNotice style={{ marginTop: 18 }} text="No QR code is used. This code is generated and validated on this device for demonstration — production codes must be issued and verified by the GoSip backend." />
      </Screen>
    );
  }

  // ── Category selection ────────────────────────────────────────────────────
  const choose = (id: DrinkCategoryId) => {
    setError(null);
    const res = issueCode(venue.id, id);
    if (!res.ok) return setError(res.reason);
    router.setParams({ rid: res.record.id });
  };
  const tierOk = plan!.venueTiers.includes(venue.tier);

  return (
    <Screen title={t("redeem.select")} back testID="redeem-select" maxWidth={640}>
      <T v="small" style={{ marginBottom: 14 }}>{venue.name}. Two complimentary drinks a day across all venues · {ent?.remaining ?? 0} left today.</T>
      {existing ? (
        <Pressable onPress={() => router.setParams({ rid: existing.id })} style={styles.existing} testID="existing-code">
          <ShieldCheck size={18} color={C.gold} />
          <T v="small" color={C.ivory} style={{ flex: 1 }}>You already have an active code for {venue.name}: {prettyCode(existing.code)}. Tap to show it.</T>
          <ChevronRight size={16} color={C.gold} />
        </Pressable>
      ) : null}
      {!tierOk ? (
        <View style={styles.warn}><TriangleAlert size={18} color={C.warning} /><T v="small" color={C.ivory} style={{ flex: 1 }}>{venue.name} is a Premium venue. Upgrade to Premium to redeem here.</T></View>
      ) : null}
      {error ? <View style={styles.warn} testID="redeem-error"><TriangleAlert size={18} color={C.danger} /><T v="small" color={C.ivory} style={{ flex: 1 }}>{error}</T></View> : null}
      <View style={styles.list}>
        {categories.map((c, i) => {
          const inPlan = plan!.drinkCategories.includes(c.id);
          const served = venue.drinkCategories.includes(c.id);
          const enabled = inPlan && served && tierOk && (ent?.remaining ?? 0) > 0;
          const sub = !served ? t("redeem.notHere") : !inPlan ? t("redeem.locked") : c.ageRestricted ? t("redeem.idCheck") : c.description;
          return (
            <React.Fragment key={c.id}>
              {i > 0 ? <Divider style={{ backgroundColor: "rgba(20,27,38,0.08)" }} /> : null}
              <Pressable testID={`cat-${c.id}`} disabled={!enabled} onPress={() => choose(c.id)} style={({ hovered }: any) => [styles.item, hovered && enabled && { backgroundColor: C.ivoryDim }]}>
                <DrinkIcon name={c.icon} size={22} color={enabled ? C.danger : "#C4B9A8"} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemT, !enabled && { color: "#9AA0A8" }]}>{c.name}</Text>
                  <Text style={[styles.itemS, (!inPlan || !served) && { color: C.warmGold }]}>{sub}</Text>
                </View>
                {enabled ? <ChevronRight size={18} color={C.inkSoft} /> : <Lock size={15} color="#B7AE9F" />}
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>
      {ent && ent.remaining === 0 ? <T v="small" center style={{ marginTop: 14 }}>You've used today's two complimentary drinks. Your allowance resets at midnight Dubai time.</T> : null}
      <T v="caption" style={{ marginTop: 14 }}>Only categories included in your {plan!.shortName} package and served at this venue can be selected. Selecting a drink generates a unique single-use code valid for 15 minutes.</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: C.ivory, borderRadius: R.lg, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  itemT: { fontFamily: F.semibold, fontSize: 15, color: C.ink },
  itemS: { fontFamily: F.body, fontSize: 12, color: C.inkSoft, marginTop: 2 },
  warn: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: R.md, backgroundColor: C.dangerWash, borderWidth: 1, borderColor: "rgba(226,120,106,0.3)", marginBottom: 12 },
  existing: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: R.md, backgroundColor: C.goldWash, borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  codeCard: { backgroundColor: C.ivory, borderRadius: R.xl, padding: 22, marginTop: 18 },
  codeRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 14 },
  codeBox: { width: 38, height: 54, borderRadius: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.warmGold, alignItems: "center", justifyContent: "center" },
  codeChar: { fontFamily: F.bold, fontSize: 26, color: C.ink },
  codeDash: { fontFamily: F.bold, fontSize: 24, color: C.bronze, marginHorizontal: 2 },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, gap: 12 },
  k: { fontFamily: F.body, fontSize: 13, color: C.inkSoft },
  v: { fontFamily: F.semibold, fontSize: 13, color: C.ink, textAlign: "right", flexShrink: 1 },
  expiry: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, padding: 14, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  successWrap: { alignItems: "center", gap: 14, paddingTop: 50 },
  burst: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash, borderWidth: 2, borderColor: C.gold, marginBottom: 6 },
});
