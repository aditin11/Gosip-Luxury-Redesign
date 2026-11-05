import React, { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ban, CircleCheck, CircleX, Clock, Hourglass, LogOut, Shirt, Store, TriangleAlert } from "lucide-react-native";
import { REDEMPTION_RULES } from "@/gosip/config/brand";
import { TIER_LABEL } from "@/gosip/config/plans";
import { getDrinkCategory } from "@/gosip/data/drinks";
import { useGoSip, useNow, SAMPLE_CODES } from "@/gosip/store/GoSipProvider";
import { effectiveStatus, type VerifyResult } from "@/gosip/store/redemption";
import { C, F, R } from "@/gosip/theme/tokens";
import { dayKey, formatCountdown, formatDateTime, formatTime, normalizeCode, prettyCode } from "@/gosip/utils/format";
import { GoSipLogo } from "@/gosip/ui/Brand";
import { Badge, Button, Card, Chip, DemoNotice, Field, Stat, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";
import { DrinkIcon } from "@/gosip/ui/DrinkIcon";

function maskName(name: string) {
  const [first, ...rest] = name.split(" ");
  return `${first} ${rest.map((r) => r[0] + ".").join(" ")}`.trim();
}

function StaffLogin() {
  const { state, dispatch } = useGoSip();
  const [venueId, setVenueId] = useState("downtown-social");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const venues = state.venues.filter((v) => v.active);
  const venue = state.venues.find((v) => v.id === venueId);
  const submit = () => {
    if (!venue) return;
    if (pin !== venue.staffPin) return setError("Incorrect PIN for this venue.");
    dispatch({ type: "STAFF_LOGIN", venueId });
  };
  return (
    <Screen title="Venue staff portal" back hideNav maxWidth={620} testID="staff-login">
      <View style={{ alignItems: "center", marginVertical: 16, gap: 8 }}>
        <GoSipLogo size={30} />
        <Badge label="Venue partner access" tone="gold" />
      </View>
      <Card style={{ gap: 14 }}>
        <T v="label">Select your venue</T>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {venues.map((v) => <Chip key={v.id} testID={`staff-venue-${v.id}`} label={v.name} active={venueId === v.id} onPress={() => { setVenueId(v.id); setError(null); }} />)}
        </View>
        <Field testID="staff-pin" label="Staff PIN" value={pin} onChangeText={(x) => setPin(x.replace(/\D/g, "").slice(0, 4))} keyboardType="number-pad" secureTextEntry placeholder="4-digit PIN" onSubmitEditing={submit} />
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <Button testID="staff-login-submit" label="Open venue portal" size="lg" full onPress={submit} />
        <Pressable onPress={() => venue && setPin(venue.staffPin)} testID="staff-fill-pin">
          <DemoNotice text={`Sample staff access — ${venue?.name}: PIN ${venue?.staffPin}. Tap to fill.`} />
        </Pressable>
      </Card>
    </Screen>
  );
}

export default function StaffPortal() {
  const router = useRouter();
  const { state, dispatch, verify, venueById, memberById } = useGoSip();
  const { isDesktop } = useLayout();
  const now = useNow(1000);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const venue = state.staffVenueId ? venueById(state.staffVenueId) : undefined;

  const venueRecords = useMemo(
    () => (venue ? state.redemptions.filter((r) => r.venueId === venue.id).sort((a, b) => (b.redeemedAt ?? b.createdAt) - (a.redeemedAt ?? a.createdAt)) : []),
    [state.redemptions, venue],
  );

  if (!venue) return <StaffLogin />;

  const today = dayKey(now);
  const redeemedToday = venueRecords.filter((r) => effectiveStatus(r, now) === "redeemed" && r.redeemedAt && dayKey(r.redeemedAt) === today);
  const pending = venueRecords.filter((r) => effectiveStatus(r, now) === "pending");
  const membersToday = new Set(redeemedToday.map((r) => r.memberId)).size;

  const doVerify = () => {
    setConfirmed(null);
    if (normalizeCode(input).length !== REDEMPTION_RULES.codeLength) {
      setResult({ kind: "invalid" });
      return;
    }
    setResult(verify(input, venue.id));
  };
  const doConfirm = () => {
    if (result?.kind !== "valid") return;
    dispatch({ type: "CONFIRM_REDEMPTION", id: result.record.id, now: Date.now() });
    setConfirmed(result.record.id);
    setResult(null);
    setInput("");
  };

  const confirmedRecord = confirmed ? state.redemptions.find((r) => r.id === confirmed) : undefined;
  const code = normalizeCode(input);

  const resultPanel = (() => {
    if (confirmedRecord) {
      const m = memberById(confirmedRecord.memberId);
      return (
        <View style={[styles.result, styles.ok]} testID="verify-confirmed">
          <CircleCheck size={26} color={C.success} />
          <View style={{ flex: 1 }}>
            <T v="h3">Redemption confirmed</T>
            <T v="small">{getDrinkCategory(confirmedRecord.categoryId).name} for {m ? maskName(m.name) : "member"} · {formatTime(confirmedRecord.redeemedAt ?? now)}. Serve one complimentary drink.</T>
          </View>
        </View>
      );
    }
    if (!result) return null;
    const rec = "record" in result ? result.record : undefined;
    const m = rec ? memberById(rec.memberId) : undefined;
    const map: Record<VerifyResult["kind"], { tone: object; Icon: typeof CircleX; color: string; title: string; body: string }> = {
      valid: { tone: styles.ok, Icon: CircleCheck, color: C.success, title: "Valid code", body: rec ? `${getDrinkCategory(rec.categoryId).name} · ${m ? maskName(m.name) : "Member"} · expires in ${formatCountdown(rec.expiresAt - now)}. Check photo ID for alcoholic drinks, then confirm.` : "" },
      invalid: { tone: styles.bad, Icon: CircleX, color: C.danger, title: "Invalid code", body: "No GoSip code matches. Check the characters with the member (codes are 6 letters/numbers)." },
      wrongVenue: { tone: styles.bad, Icon: Ban, color: C.danger, title: "Code belongs to another venue", body: rec ? `This code was issued for ${venueById(rec.venueId)?.name}. It cannot be redeemed here.` : "" },
      expired: { tone: styles.warn, Icon: Hourglass, color: C.warning, title: "Code expired", body: rec ? `Expired at ${formatTime(rec.expiresAt)}. Ask the member to generate a new code in the app.` : "" },
      alreadyRedeemed: { tone: styles.warn, Icon: TriangleAlert, color: C.warning, title: "Already redeemed", body: rec ? `This code was redeemed at ${formatDateTime(rec.redeemedAt ?? rec.createdAt)}. Codes are single-use.` : "" },
      cancelled: { tone: styles.bad, Icon: Ban, color: C.danger, title: "Code cancelled", body: "The member cancelled this code. Ask them to generate a new one." },
    };
    const s = map[result.kind];
    return (
      <View style={[styles.result, s.tone]} testID={`verify-${result.kind}`}>
        <s.Icon size={26} color={s.color} />
        <View style={{ flex: 1, gap: 4 }}>
          <T v="h3">{s.title}</T>
          <T v="small">{s.body}</T>
          {result.kind === "valid" ? <Button testID="confirm-redemption" label="Confirm redemption" onPress={doConfirm} style={{ marginTop: 8 }} /> : null}
        </View>
      </View>
    );
  })();

  const verifyCard = (
    <Card style={{ gap: 14 }}>
      <T v="label">Verify redemption</T>
      <T v="h1">Enter the member's code</T>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.codeRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <React.Fragment key={i}>
            {i === 3 ? <Text style={styles.dash}>–</Text> : null}
            <View style={[styles.box, code.length === i && styles.boxFocus]}><Text style={styles.boxT}>{code[i] ?? ""}</Text></View>
          </React.Fragment>
        ))}
        <TextInput
          ref={inputRef}
          testID="staff-code-input"
          value={input}
          onChangeText={(x) => { setInput(normalizeCode(x).slice(0, 6)); setResult(null); setConfirmed(null); }}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          style={styles.hiddenInput}
          onSubmitEditing={doVerify}
          accessibilityLabel="Redemption code"
        />
      </Pressable>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button testID="verify-code" label="Verify" size="lg" style={{ flex: 1 }} full onPress={doVerify} disabled={code.length < 6} />
        <Button label="Clear" variant="ghost" size="lg" onPress={() => { setInput(""); setResult(null); setConfirmed(null); }} />
      </View>
      {resultPanel}
      <DemoNotice text={`Demo codes for Downtown Social: valid ${prettyCode(SAMPLE_CODES.valid)}, ${prettyCode(SAMPLE_CODES.validSecond)} · redeemed ${prettyCode(SAMPLE_CODES.alreadyRedeemed)} · expired ${prettyCode(SAMPLE_CODES.expired)} · other venue ${prettyCode(SAMPLE_CODES.otherVenue)}. Verification runs on this device only — production must validate on the backend.`} />
    </Card>
  );

  const info = (
    <Card style={{ gap: 10 }}>
      <T v="label">Venue information</T>
      <T v="h2">{venue.name}</T>
      <T v="small">{venue.area} · {TIER_LABEL[venue.tier]} tier · {venue.address}</T>
      <T v="bodyStrong" style={{ marginTop: 6, fontSize: 14 }}>Available benefits</T>
      {venue.benefits.map((b) => <T key={b} v="small">• {b}</T>)}
      <T v="bodyStrong" style={{ marginTop: 6, fontSize: 14 }}>Eligible drink categories</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {venue.drinkCategories.map((c) => {
          const cat = getDrinkCategory(c);
          return <View key={c} style={styles.cat}><DrinkIcon name={cat.icon} size={13} color={C.gold} /><Text style={styles.catT}>{cat.name}</Text></View>;
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 6 }}><Clock size={14} color={C.gold} /><T v="small">{venue.hours.map((h) => `${h.days} ${h.open}–${h.close}`).join(" · ")}</T></View>
      <T v="small" color={C.gold}>{venue.memberHours}</T>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Shirt size={14} color={C.gold} /><T v="small">{venue.dressCode}</T></View>
      <T v="bodyStrong" style={{ marginTop: 6, fontSize: 14 }}>Member restrictions</T>
      {[...venue.restrictions, ...venue.entryRequirements].map((b) => <T key={b} v="small">• {b}</T>)}
    </Card>
  );

  const history = (
    <Card padded={false}>
      <View style={{ padding: 16, paddingBottom: 8 }}><T v="label">Redemption history</T></View>
      {venueRecords.slice(0, 14).map((r, i) => {
        const st = effectiveStatus(r, now);
        const m = memberById(r.memberId);
        return (
          <View key={r.id} style={[styles.hrow, i > 0 && { borderTopWidth: 1, borderTopColor: C.lineSoft }]}>
            <Text style={styles.hcode}>{prettyCode(r.code)}</Text>
            <View style={{ flex: 1 }}>
              <T v="small" color={C.ivory}>{m ? maskName(m.name) : "Member"} · {getDrinkCategory(r.categoryId).name}</T>
              <T v="caption">{formatDateTime(r.redeemedAt ?? r.createdAt)}</T>
            </View>
            <Badge label={st} tone={st === "redeemed" ? "success" : st === "pending" ? "gold" : "muted"} />
          </View>
        );
      })}
    </Card>
  );

  return (
    <Screen hideNav testID="staff-portal">
      <View style={[styles.top, { marginTop: isDesktop ? 24 : 8 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexGrow: 1, flexBasis: isDesktop ? 0 : "100%" }}>
          <View style={styles.storeIcon}><Store size={20} color={C.gold} /></View>
          <View style={{ flex: 1 }}>
            <T v="label">GoSip venue portal</T>
            <T v="h1" numberOfLines={1}>{venue.name}</T>
          </View>
        </View>
        <Button label="Customer app" size="sm" variant="ghost" onPress={() => router.push("/")} />
        <Button testID="staff-logout" label="Sign out" size="sm" variant="outline" icon={<LogOut size={14} color={C.gold} />} onPress={() => dispatch({ type: "STAFF_LOGOUT" })} />
      </View>
      <View style={styles.stats}>
        <Card style={{ flex: 1 }}><Stat value={String(redeemedToday.length)} label="Redeemed today" accent /></Card>
        <Card style={{ flex: 1 }}><Stat value={String(membersToday)} label="Members served" /></Card>
        <Card style={{ flex: 1 }}><Stat value={String(pending.length)} label="Open codes" /></Card>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: "row", gap: 20, marginTop: 16 }}>
          <View style={{ flex: 1.2, gap: 16 }}>{verifyCard}{history}</View>
          <View style={{ flex: 1 }}>{info}</View>
        </View>
      ) : (
        <View style={{ gap: 16, marginTop: 16 }}>{verifyCard}{history}{info}</View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  err: { fontFamily: F.medium, color: C.danger, fontSize: 13 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  storeIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.goldWash, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  stats: { flexDirection: "row", gap: 12, marginTop: 16 },
  codeRow: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  box: { width: 42, height: 56, borderRadius: 10, borderWidth: 1.5, borderColor: C.lineSoft, backgroundColor: "rgba(255,255,255,0.04)", alignItems: "center", justifyContent: "center" },
  boxFocus: { borderColor: C.gold },
  boxT: { fontFamily: F.bold, fontSize: 26, color: C.ivory },
  dash: { fontFamily: F.bold, fontSize: 22, color: C.bronze },
  hiddenInput: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.011, color: "transparent", fontSize: 16 },
  result: { flexDirection: "row", gap: 12, padding: 14, borderRadius: R.md, borderWidth: 1, alignItems: "flex-start" },
  ok: { backgroundColor: C.successWash, borderColor: "rgba(108,197,152,0.35)" },
  bad: { backgroundColor: C.dangerWash, borderColor: "rgba(226,120,106,0.35)" },
  warn: { backgroundColor: "rgba(230,179,90,0.12)", borderColor: "rgba(230,179,90,0.35)" },
  cat: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, height: 28, borderRadius: 999, borderWidth: 1, borderColor: C.line },
  catT: { fontFamily: F.medium, fontSize: 11.5, color: C.ivory },
  hrow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  hcode: { fontFamily: F.semibold, fontSize: 12.5, color: C.gold, letterSpacing: 1.2, width: 72 },
});
