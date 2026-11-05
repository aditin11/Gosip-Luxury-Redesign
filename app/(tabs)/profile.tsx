import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BarChart3, Bell, Crown, Gift, Globe, History, KeyRound, LayoutDashboard, LogOut, MapPin, RotateCcw, ShieldCheck, Store, Wallet, Heart } from "lucide-react-native";
import { COUNTRIES } from "@/gosip/data/locations";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { formatDate } from "@/gosip/utils/format";
import { VenueCard } from "@/gosip/ui/Media";
import { Badge, Button, Card, Chip, Grid, ListRow, T, Toggle, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function Profile() {
  const router = useRouter();
  const { member, plan, state, dispatch, t, lang, membershipActive, entitlement } = useGoSip();
  const { isDesktop, cols } = useLayout();
  const active = membershipActive();
  const ent = entitlement();
  const saved = state.venues.filter((v) => state.savedVenueIds.includes(v.id));
  const redeemedCount = member ? state.redemptions.filter((r) => r.memberId === member.id && r.status === "redeemed").length : 0;

  const reset = () => {
    dispatch({ type: "RESET" });
    router.replace("/onboarding");
  };

  const ic = (Icon: typeof Crown) => <Icon size={18} color={C.gold} />;

  return (
    <Screen title={isDesktop ? undefined : t("profile.title")} testID="profile-screen">
      <View style={[styles.head, isDesktop && { marginTop: 32 }]}>
        <View style={styles.avatar}><Text style={styles.avatarT}>{member?.avatarInitials ?? "GS"}</Text></View>
        <View style={{ flex: 1, gap: 4 }}>
          <T v="h1">{member?.name ?? "Guest"}</T>
          <T v="small">{member ? `Member ID ${member.id}` : "Browsing without an account"}</T>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            {plan ? <Badge label={plan.name} tone="solid" /> : null}
            <Badge label={active ? "Active" : member?.status === "pending" ? "No package" : member ? "Expired" : "Guest"} tone={active ? "success" : "muted"} />
            {member?.expiryDate ? <Badge label={`Expires ${formatDate(member.expiryDate)}`} tone="muted" /> : null}
          </View>
        </View>
        {!member ? <Button label={t("common.joinNow")} size="sm" onPress={() => router.push("/login?mode=signup")} /> : null}
      </View>

      {member ? (
        <View style={styles.tiles}>
          <Pressable style={styles.tile} onPress={() => router.push("/card")}><Crown size={20} color={C.gold} /><Text style={styles.tileT}>{t("profile.membership")}</Text><Text style={styles.tileS}>{plan?.shortName ?? "—"}</Text></Pressable>
          <Pressable style={styles.tile} onPress={() => router.push("/drinks")}><Wallet size={20} color={C.gold} /><Text style={styles.tileT}>Drinks today</Text><Text style={styles.tileS}>{ent ? `${ent.remaining} of ${ent.perDay} left` : "—"}</Text></Pressable>
          <Pressable style={styles.tile} onPress={() => router.push("/usage")}><History size={20} color={C.gold} /><Text style={styles.tileT}>History</Text><Text style={styles.tileS}>{redeemedCount} total</Text></Pressable>
        </View>
      ) : null}

      <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 20, marginTop: 20 }}>
        <View style={{ flex: 1, gap: 16 }}>
          <Card padded={false} style={{ paddingHorizontal: 14 }}>
            <ListRow testID="row-usage" icon={ic(BarChart3)} title={t("profile.usage")} subtitle="Drinks used, venues visited, activity" onPress={() => router.push("/usage")} />
            <ListRow icon={ic(History)} title={t("profile.redemptions")} subtitle="Every drink you've redeemed" onPress={() => router.push("/drinks")} />
            <ListRow icon={ic(Gift)} title={t("profile.benefits")} subtitle="Food discounts, offers & member events" onPress={() => router.push("/offers")} />
            <ListRow icon={ic(Wallet)} title={t("profile.plans")} subtitle="Change or renew your package" onPress={() => router.push("/packages")} />
            <ListRow testID="row-security" icon={ic(ShieldCheck)} title={t("profile.security")} subtitle="Face ID, fingerprint, app lock, devices" onPress={() => router.push("/security")} />
          </Card>

          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Globe size={18} color={C.gold} /><T v="h3">{t("profile.language")}</T></View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip testID="lang-en" label="English" active={lang === "en"} onPress={() => dispatch({ type: "SET_LANGUAGE", lang: "en" })} />
              <Chip testID="lang-ar" label="العربية" active={lang === "ar"} onPress={() => dispatch({ type: "SET_LANGUAGE", lang: "ar" })} />
            </View>
            <T v="caption">Arabic switches the interface to right-to-left. Venue descriptions remain in English in this demo.</T>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}><MapPin size={18} color={C.gold} /><T v="h3">{t("profile.location")}</T></View>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {COUNTRIES.map((c) => (
                <Chip key={c.id} label={`${c.name} · ${c.currency} · ${c.dialCode}`} active={state.settings.countryId === c.id} onPress={() => dispatch({ type: "SET_LOCATION", countryId: c.id, cityId: c.cities[0].id })} />
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Bell size={18} color={C.gold} /><T v="h3">Offer notifications</T></View>
              <Toggle value={state.settings.notifications} onChange={(on) => dispatch({ type: "SET_NOTIFICATIONS", on })} />
            </View>
          </Card>
        </View>

        <View style={{ flex: 1, gap: 16 }}>
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Heart size={18} color={C.gold} /><T v="h3">{t("profile.saved")} ({saved.length})</T></View>
            {saved.length ? (
              <Grid cols={cols(1, 2, 1)} gap={10}>
                {saved.map((v) => <VenueCard key={v.id} venue={v} variant="row" />)}
              </Grid>
            ) : (
              <T v="small">Tap the heart on any venue to save it here.</T>
            )}
          </Card>
          <Card padded={false} style={{ paddingHorizontal: 14 }}>
            <ListRow testID="row-staff" icon={ic(Store)} title="Venue staff portal" subtitle="Demo: verify member redemption codes" onPress={() => router.push("/staff")} />
            <ListRow testID="row-admin" icon={ic(LayoutDashboard)} title="Admin dashboard" subtitle="Demo: venues, members, plans & codes" onPress={() => router.push("/admin")} />
            <ListRow icon={ic(KeyRound)} title="About this demo" subtitle="What is simulated and what needs a backend" onPress={() => router.push("/modal")} />
            <ListRow testID="row-reset" icon={ic(RotateCcw)} title={t("profile.reset")} subtitle="Restore sample members, venues and codes" onPress={reset} />
          </Card>
          {member || state.session ? (
            <Button testID="logout" label={t("profile.logout")} variant="danger" full icon={<LogOut size={16} color={C.danger} />} onPress={() => { dispatch({ type: "SIGN_OUT" }); router.replace("/onboarding"); }} />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 1.5, borderColor: C.gold, backgroundColor: C.goldWash, alignItems: "center", justifyContent: "center" },
  avatarT: { fontFamily: F.display, fontSize: 26, color: C.gold },
  tiles: { flexDirection: "row", gap: 12, marginTop: 20 },
  tile: { flex: 1, padding: 14, gap: 6, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  tileT: { fontFamily: F.semibold, fontSize: 13, color: C.ivory },
  tileS: { fontFamily: F.body, fontSize: 12, color: C.muted },
});
