import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Fingerprint, Lock, ScanFace, Smartphone, BellRing, Monitor } from "lucide-react-native";
import { useGoSip, type SecurityPrefs } from "@/gosip/store/GoSipProvider";
import { C } from "@/gosip/theme/tokens";
import { formatDateTime } from "@/gosip/utils/format";
import { Badge, Card, DemoNotice, ListRow, T, Toggle } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function Security() {
  const { state, dispatch, t, hydrated } = useGoSip();
  const s = state.settings.security;
  const set = (patch: Partial<SecurityPrefs>) => dispatch({ type: "SET_SECURITY", patch });
  const ic = (I: typeof Lock) => <I size={18} color={C.gold} />;
  const rows: { key: keyof SecurityPrefs; title: string; sub: string; icon: React.ReactNode }[] = [
    { key: "faceId", title: "Face ID", sub: "Unlock GoSip with Face ID (iOS)", icon: ic(ScanFace) },
    { key: "fingerprint", title: "Fingerprint", sub: "Unlock with fingerprint / Touch ID", icon: ic(Fingerprint) },
    { key: "appLock", title: "App lock", sub: "Require unlock each time GoSip opens", icon: ic(Lock) },
    { key: "singleDevice", title: "Single-device login", sub: "Prefer one active device per membership", icon: ic(Smartphone) },
    { key: "loginAlerts", title: "New-login alerts", sub: "Notify me when my account signs in elsewhere", icon: ic(BellRing) },
  ];
  return (
    <Screen title={t("security.title")} back testID="security-screen" maxWidth={760}>
      <DemoNotice text="Demonstration interface. No native biometric integration exists in this project, so these switches store preferences only. Single-device access must be enforced by the backend — this screen does not enforce it." />
      <Card padded={false} style={{ paddingHorizontal: 14, marginTop: 16 }}>
        {rows.map((r) => (
          <ListRow key={r.key} icon={r.icon} title={r.title} subtitle={r.sub} right={<Toggle testID={`sec-${r.key}`} value={s[r.key]} onChange={(v) => set({ [r.key]: v } as Partial<SecurityPrefs>)} />} />
        ))}
      </Card>
      <T v="label" style={{ marginTop: 24, marginBottom: 10 }}>Trusted devices (sample)</T>
      <Card padded={false} style={{ paddingHorizontal: 14 }}>
        <ListRow icon={ic(Monitor)} title={Platform.OS === "web" ? "This browser" : "This device"} subtitle={hydrated ? `Current session · ${formatDateTime(Date.now())}` : "Current session"} right={<Badge label="Current" tone="success" />} />
        <ListRow icon={ic(Smartphone)} title="iPhone 15 Pro" subtitle="Dubai, UAE · last active 2 days ago" right={<Badge label="Trusted" tone="gold" />} />
      </Card>
      <T v="label" style={{ marginTop: 24, marginBottom: 10 }}>Session information</T>
      <Card style={{ gap: 6 }}>
        <View style={styles.kv}><T v="small">Signed in as</T><T v="bodyStrong" style={{ fontSize: 14 }}>{state.session?.memberId ?? "Guest"}</T></View>
        <View style={styles.kv}><T v="small">Platform</T><T v="bodyStrong" style={{ fontSize: 14 }}>{Platform.OS}</T></View>
        <View style={styles.kv}><T v="small">Timezone</T><T v="bodyStrong" style={{ fontSize: 14 }}>Asia/Dubai (UTC+4)</T></View>
        <View style={styles.kv}><T v="small">Session storage</T><T v="bodyStrong" style={{ fontSize: 14 }}>{Platform.OS === "web" ? "Browser localStorage (demo)" : "In-memory (demo)"}</T></View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 } });
