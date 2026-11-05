import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Check, CreditCard } from "lucide-react-native";
import { BRAND, FOOD_DISCOUNT } from "@/gosip/config/brand";
import { TIER_LABEL } from "@/gosip/config/plans";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C } from "@/gosip/theme/tokens";
import { MembershipCard } from "@/gosip/ui/MembershipCard";
import { Button, Card, DemoNotice, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function MyCard() {
  const router = useRouter();
  const { member, plan, t, membershipActive, entitlement } = useGoSip();
  const { width, isDesktop, gutter } = useLayout();
  const cardW = Math.min(isDesktop ? 460 : width - gutter * 2, 460);
  const active = membershipActive();
  const ent = entitlement();

  if (!member) {
    return (
      <Screen title={isDesktop ? undefined : t("card.title")} testID="card-screen">
        <Card style={{ alignItems: "center", gap: 12, paddingVertical: 36, marginTop: isDesktop ? 40 : 8 }}>
          <CreditCard size={34} color={C.gold} />
          <T v="h1" center>Your digital membership card</T>
          <T v="small" center>Create an account to receive your GoSip card.</T>
          <Button label={t("common.joinNow")} onPress={() => router.push("/login?mode=signup")} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={isDesktop ? undefined : t("card.title")} testID="card-screen">
      <View style={[{ gap: 24, marginTop: isDesktop ? 36 : 4 }, isDesktop && { flexDirection: "row", alignItems: "flex-start" }]}>
        <View style={{ alignItems: "center", gap: 14 }}>
          <MembershipCard member={member} plan={plan} active={active} width={cardW} />
          <T v="caption" center style={{ maxWidth: cardW }}>Show this card at participating venues for food discounts and entry. Drinks are confirmed with a one-time redemption code.</T>
        </View>
        <View style={{ flex: 1, gap: 14 }}>
          <Card style={{ gap: 10 }}>
            <T v="label">Membership</T>
            <T v="h1">{plan ? plan.name : "No active package"}</T>
            <T v="small">{active ? `${ent?.remaining ?? 0} of ${plan?.drinksPerDay} drinks left today` : "Choose a package to activate your card."}</T>
            {plan ? (
              <View style={{ gap: 7, marginTop: 4 }}>
                {[
                  `${plan.drinksPerDay} complimentary drinks every day`,
                  `${plan.foodDiscountPercent}% off food at participating venues`,
                  `${plan.venueTiers.map((x) => TIER_LABEL[x]).join(", ")} venues`,
                  ...plan.highlights.slice(1, 2),
                ].map((b) => (
                  <View key={b} style={{ flexDirection: "row", gap: 8 }}><Check size={15} color={C.gold} style={{ marginTop: 3 }} /><T v="body" style={{ flex: 1, fontSize: 14 }}>{b}</T></View>
                ))}
              </View>
            ) : null}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              <Button label={plan ? "Change package" : t("home.choosePlan")} size="sm" onPress={() => router.push("/packages")} />
              <Button label="Food discounts" size="sm" variant="outline" onPress={() => router.push("/offers")} />
            </View>
          </Card>
          <Card tone="gold" style={{ gap: 6 }}>
            <T v="label">{FOOD_DISCOUNT.headline}</T>
            <T v="small">{BRAND.promise}</T>
          </Card>
          <DemoNotice text="This card contains no QR code or barcode. Card status is a frontend demonstration and is not a verified entitlement." />
        </View>
      </View>
    </Screen>
  );
}

