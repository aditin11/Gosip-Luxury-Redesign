import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import type { Member } from "../data/members";
import type { MembershipPlan } from "../config/plans";
import { C, F, R } from "../theme/tokens";
import { formatDate } from "../utils/format";
import { useGoSip } from "../store/GoSipProvider";
import { DubaiSkyline, GoSipLogo } from "./Brand";

/** Premium digital membership card — gold detailing, no QR code. */
export function MembershipCard({ member, plan, active, width = 360 }: { member: Member; plan: MembershipPlan | null; active: boolean; width?: number }) {
  const { t } = useGoSip();
  const h = width * 0.62;
  const tierColors: Record<string, [string, string, string]> = {
    gold: ["#2B2213", "#16120A", "#0B0B0D"],
    teal: ["#123B52", "#0B1F30", "#081320"],
    navy: ["#17263B", "#0D1726", "#090F19"],
  };
  const colors = tierColors[plan?.accent ?? "navy"];
  return (
    <View style={[styles.wrap, { width, height: h }]} testID="membership-card">
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {/* Guilloche-style gold lines */}
      <Svg width="100%" height="100%" viewBox="0 0 360 223" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Path key={i} d={`M${-40 + i * 18} 223 C ${80 + i * 14} ${120 - i * 6}, ${200 + i * 10} ${200 - i * 12}, ${400} ${30 + i * 9}`} stroke={C.gold} strokeOpacity={0.09} strokeWidth={1} fill="none" />
        ))}
      </Svg>
      <View style={styles.sky}><DubaiSkyline height={h * 0.32} color="rgba(232,189,112,0.08)" windows={false} /></View>
      <View style={styles.inner}>
        <View style={styles.top}>
          <GoSipLogo size={width * 0.07} align="flex-start" />
          <View style={[styles.status, { borderColor: active ? "rgba(108,197,152,0.5)" : "rgba(226,120,106,0.5)" }]}>
            <View style={[styles.dot, { backgroundColor: active ? C.success : C.danger }]} />
            <Text style={[styles.statusT, { color: active ? C.success : C.danger }]}>{active ? "ACTIVE" : member.status === "pending" ? "NO PLAN" : "EXPIRED"}</Text>
          </View>
        </View>
        <View style={styles.chip} />
        <View>
          <Text style={styles.k}>{t("card.member")}</Text>
          <Text style={[styles.name, { fontSize: width * 0.06 }]} numberOfLines={1}>{member.name}</Text>
          <Text style={styles.id}>{member.id}</Text>
        </View>
        <View style={styles.bottom}>
          <View>
            <Text style={styles.k}>{t("card.tier")}</Text>
            <Text style={styles.v}>{plan ? plan.shortName.toUpperCase() : "—"}</Text>
          </View>
          <View>
            <Text style={styles.k}>{t("card.validUntil")}</Text>
            <Text style={styles.v}>{member.expiryDate ? formatDate(member.expiryDate) : "—"}</Text>
          </View>
          <View>
            <Text style={styles.k}>DRINKS</Text>
            <Text style={styles.v}>{plan ? `${plan.drinksPerDay} / DAY` : "—"}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.border, { pointerEvents: "none" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: R.xl, overflow: "hidden", boxShadow: "0px 14px 28px rgba(0,0,0,0.5)" },
  border: { ...StyleSheet.absoluteFillObject, borderRadius: R.xl, borderWidth: 1.2, borderColor: "rgba(232,189,112,0.55)" },
  inner: { flex: 1, padding: 22, justifyContent: "space-between" },
  sky: { position: "absolute", left: 0, right: 0, bottom: 0 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  status: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusT: { fontFamily: F.bold, fontSize: 10, letterSpacing: 1.5 },
  chip: { width: 40, height: 30, borderRadius: 6, backgroundColor: "rgba(232,189,112,0.75)", borderWidth: 1, borderColor: "#F3D79F", position: "absolute", right: 22, top: "42%" },
  k: { fontFamily: F.semibold, fontSize: 9, letterSpacing: 2, color: C.bronze },
  name: { fontFamily: F.display, color: C.ivory, marginTop: 2 },
  id: { fontFamily: F.medium, fontSize: 12.5, color: C.gold, letterSpacing: 2.4, marginTop: 2 },
  bottom: { flexDirection: "row", justifyContent: "space-between" },
  v: { fontFamily: F.bold, fontSize: 12.5, color: C.ivory, letterSpacing: 1.2, marginTop: 2 },
});
