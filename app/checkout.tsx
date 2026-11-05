import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { CircleCheck, CircleX, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react-native";
import { useGoSip, type PaymentMethod } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { formatDate, formatMoney, DAY } from "@/gosip/utils/format";
import { Button, Card, DemoNotice, Divider, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

const METHODS: { id: PaymentMethod; label: string; sub: string; Icon: typeof CreditCard }[] = [
  { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard", Icon: CreditCard },
  { id: "applePay", label: "Apple Pay", sub: "Pay with Face ID / Touch ID", Icon: Smartphone },
  { id: "googlePay", label: "Google Pay", sub: "Pay with your Google account", Icon: Smartphone },
  { id: "tabby", label: "Tabby", sub: "Pay later in instalments", Icon: Wallet },
  { id: "bankTransfer", label: "Bank Transfer", sub: "Manual transfer, activated on receipt", Icon: Landmark },
];

export default function Checkout() {
  const router = useRouter();
  const { state, dispatch, member, t, hydrated } = useGoSip();
  const { isDesktop } = useLayout();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [phase, setPhase] = useState<"choose" | "processing" | "success" | "failed">("choose");
  const [ref, setRef] = useState("");
  const [planIdAtPay, setPlanIdAtPay] = useState(state.pendingPlanId);
  const plan = state.plans.find((p) => p.id === (planIdAtPay ?? state.pendingPlanId));

  useEffect(() => {
    if (state.pendingPlanId) setPlanIdAtPay(state.pendingPlanId);
  }, [state.pendingPlanId]);

  if (hydrated && phase === "choose" && !plan) return <Redirect href="/packages" />;
  if (hydrated && !member) return <Redirect href="/login?mode=signup&next=checkout" />;

  const pay = (succeed: boolean) => {
    if (!plan || !member) return;
    setPhase("processing");
    const reference = `DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setTimeout(() => {
      dispatch({
        type: "PAYMENT",
        now: Date.now(),
        payment: { id: reference, memberId: member.id, planId: plan.id, method, amountAED: plan.priceAED, at: Date.now(), outcome: succeed ? "demo-confirmed" : "demo-declined" },
      });
      setRef(reference);
      setPhase(succeed ? "success" : "failed");
    }, 1300);
  };

  if (phase === "success" && plan) {
    return (
      <Screen hideNav={false} testID="checkout-success">
        <View style={[styles.result, isDesktop && { marginTop: 60 }]}>
          <View style={styles.okRing}><CircleCheck size={44} color={C.gold} /></View>
          <T v="display" center>You're in!</T>
          <T v="body" center style={{ maxWidth: 420 }}>Your {plan.name} is now active on this demo device. Enjoy two complimentary drinks every day.</T>
          <Card style={{ alignSelf: "stretch", marginTop: 8 }}>
            <Row k="Package" v={plan.name} />
            <Row k="Valid until" v={formatDate(Date.now() + plan.durationDays * DAY)} />
            <Row k="Amount (sample)" v={formatMoney(plan.priceAED)} />
            <Row k="Method" v={METHODS.find((m) => m.id === method)!.label} />
            <Row k="Reference" v={ref} />
          </Card>
          <DemoNotice text="Sample confirmation only — no payment was taken and no card details were collected. Live payments require a payment provider integration on the backend." />
          <Button testID="start-exploring" label="Start exploring" size="lg" full onPress={() => router.replace("/")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title={t("pay.title")} back testID="checkout-screen" maxWidth={760}>
      <T v="label" style={{ marginBottom: 12 }}>Demo checkout · no real card or money</T>
      {phase === "failed" ? (
        <View style={styles.failed} testID="payment-failed">
          <CircleX size={20} color={C.danger} />
          <T v="small" color={C.ivory} style={{ flex: 1 }}>Sample payment declined ({ref}). Nothing was charged — choose another method or try again.</T>
        </View>
      ) : null}
      <View style={styles.methods}>
        {METHODS.map((m, i) => {
          const on = method === m.id;
          return (
            <React.Fragment key={m.id}>
              {i > 0 ? <Divider style={{ backgroundColor: "rgba(20,27,38,0.08)" }} /> : null}
              <Pressable testID={`method-${m.id}`} onPress={() => setMethod(m.id)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={styles.method}>
                <View style={[styles.radio, on && { borderColor: C.bronze }]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <m.Icon size={18} color={C.inkSoft} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </View>
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>
      {plan ? (
        <View style={{ marginTop: 22 }}>
          <T v="small">{t("pay.total")}</T>
          <Text style={styles.total}>{formatMoney(plan.priceAED)}</Text>
          <T v="small">{plan.name} · {plan.vatInclusive ? t("common.vatInc") : "excl. VAT"}</T>
        </View>
      ) : null}
      <View style={{ gap: 12, marginTop: 20 }}>
        <Button testID="proceed-pay" label={phase === "processing" ? "Processing…" : t("pay.proceed")} size="lg" full loading={phase === "processing"} onPress={() => pay(true)} />
        <Button testID="simulate-fail" label="Simulate a failed payment" variant="ghost" full disabled={phase === "processing"} onPress={() => pay(false)} />
      </View>
      <DemoNotice style={{ marginTop: 18 }} text="Payment options are presentation-only. No payment integration exists in this repository, so no card details are requested and no money moves. Activation happens locally to demonstrate the journey." />
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
      <T v="small">{k}</T>
      <T v="bodyStrong" style={{ fontSize: 14 }}>{v}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  methods: { backgroundColor: C.ivory, borderRadius: R.lg, overflow: "hidden" },
  method: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#B8BCC4", alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.warmGold },
  methodLabel: { fontFamily: F.semibold, fontSize: 14.5, color: C.ink },
  methodSub: { fontFamily: F.body, fontSize: 12, color: C.inkSoft, marginTop: 1 },
  total: { fontFamily: F.bold, fontSize: 34, color: C.ivory, letterSpacing: -0.6, marginVertical: 2 },
  failed: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: R.md, backgroundColor: C.dangerWash, borderWidth: 1, borderColor: "rgba(226,120,106,0.35)", marginBottom: 14 },
  result: { alignItems: "center", gap: 14, maxWidth: 520, width: "100%", alignSelf: "center", paddingTop: 30 },
  okRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: C.gold, alignItems: "center", justifyContent: "center", backgroundColor: C.goldWash },
});
