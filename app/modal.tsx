import React from "react";
import { View } from "react-native";
import { BRAND } from "@/gosip/config/brand";
import { SAMPLE_CODES } from "@/gosip/store/GoSipProvider";
import { DEMO_CREDENTIALS } from "@/gosip/data/members";
import { prettyCode } from "@/gosip/utils/format";
import { GoSipLogo } from "@/gosip/ui/Brand";
import { Card, DemoNotice, T } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function AboutDemo() {
  return (
    <Screen title="About this demo" back maxWidth={760}>
      <View style={{ alignItems: "center", marginVertical: 18 }}><GoSipLogo size={34} /></View>
      <DemoNotice text={BRAND.demoNotice} />
      <Card style={{ marginTop: 16, gap: 8 }}>
        <T v="label">Sample access</T>
        <T v="small">Member: {DEMO_CREDENTIALS.member.email} / {DEMO_CREDENTIALS.member.password}</T>
        <T v="small">Admin: {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}</T>
        <T v="small">Venue staff: Downtown Social · PIN 1001 (each sample venue has a PIN shown on the staff login)</T>
      </Card>
      <Card style={{ marginTop: 12, gap: 8 }}>
        <T v="label">Sample redemption codes (Downtown Social)</T>
        <T v="small">Valid: {prettyCode(SAMPLE_CODES.valid)} and {prettyCode(SAMPLE_CODES.validSecond)}</T>
        <T v="small">Already redeemed: {prettyCode(SAMPLE_CODES.alreadyRedeemed)}</T>
        <T v="small">Expired: {prettyCode(SAMPLE_CODES.expired)}</T>
        <T v="small">Belongs to another venue (Sky Lounge): {prettyCode(SAMPLE_CODES.otherVenue)}</T>
      </Card>
      <Card style={{ marginTop: 12, gap: 8 }}>
        <T v="label">Simulated in this build</T>
        <T v="small">Accounts, subscriptions, payments, redemption codes, staff verification, admin edits and security preferences are stored on this device only. Production requires backend APIs for authentication, payments, code issuance/validation and audit logs. Biometrics require native integration (e.g. expo-local-authentication).</T>
      </Card>
    </Screen>
  );
}
