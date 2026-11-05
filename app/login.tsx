import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { BRAND } from "@/gosip/config/brand";
import { DEMO_CREDENTIALS } from "@/gosip/data/members";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { GoSipLogo, MartiniMark } from "@/gosip/ui/Brand";
import { Photo } from "@/gosip/ui/Media";
import { Button, DemoNotice, Field, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; next?: string }>();
  const { dispatch, t, state } = useGoSip();
  const { isDesktop } = useLayout();
  // Query params are applied after mount so statically rendered HTML hydrates cleanly.
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  useEffect(() => {
    if (params.mode === "signin" || params.mode === "signup") setMode(params.mode);
  }, [params.mode]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const afterAuth = (isNew: boolean) => {
    if (params.next === "checkout" && state.pendingPlanId) router.replace("/checkout");
    else if (isNew) router.replace("/packages");
    else router.replace("/");
  };

  const submit = () => {
    setError(null);
    if (mode === "signup") {
      if (name.trim().length < 2) return setError("Please enter your name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (!accepted) return setError("Please accept the terms and confirm you are of legal drinking age.");
      const id = `GS-UAE-${String(205000 + Math.floor(Math.random() * 900)).padStart(6, "0")}`;
      dispatch({ type: "SIGN_UP", name: name.trim(), email: email.trim(), id });
      afterAuth(true);
    } else {
      const ok = email.trim().toLowerCase() === DEMO_CREDENTIALS.member.email && password === DEMO_CREDENTIALS.member.password;
      if (!ok) return setError("Use the demo member credentials shown below.");
      dispatch({ type: "SIGN_IN_DEMO" });
      afterAuth(false);
    }
  };

  const form = (
    <View style={{ gap: 14 }}>
      <View style={styles.segment}>
        {(["signup", "signin"] as const).map((m) => (
          <Pressable key={m} testID={`mode-${m}`} onPress={() => { setMode(m); setError(null); }} style={[styles.segItem, mode === m && styles.segActive]}>
            <Text style={[styles.segText, mode === m && { color: C.ink }]}>{m === "signup" ? "Create account" : t("common.signIn")}</Text>
          </Pressable>
        ))}
      </View>
      <T v="display" center={!isDesktop}>For all your going-out plans</T>
      <T v="label" center={!isDesktop}>{mode === "signup" ? "Create your account" : "Welcome back"}</T>
      {mode === "signup" ? <Field testID="name" placeholder="Your name" value={name} onChangeText={setName} autoComplete="name" /> : null}
      <Field testID="email" placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Field testID="password" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === "signup" ? "new-password" : "current-password"} onSubmitEditing={submit} />
      {mode === "signup" ? (
        <Pressable testID="accept-terms" onPress={() => setAccepted(!accepted)} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: accepted }}>
          <View style={[styles.box, accepted && { backgroundColor: C.gold, borderColor: C.gold }]}>{accepted ? <Check size={14} color={C.ink} /> : null}</View>
          <T v="small" style={{ flex: 1 }}>I accept the Terms of Service and Privacy Policy, and confirm I am of legal drinking age.</T>
        </Pressable>
      ) : null}
      {error ? <Text style={styles.error} testID="auth-error">{error}</Text> : null}
      <Button testID="auth-submit" label={mode === "signup" ? "Create account" : t("common.signIn")} size="lg" full onPress={submit} />
      {mode === "signin" ? (
        <Pressable
          testID="fill-demo"
          onPress={() => { setEmail(DEMO_CREDENTIALS.member.email); setPassword(DEMO_CREDENTIALS.member.password); }}
        >
          <DemoNotice text={`Demo member: ${DEMO_CREDENTIALS.member.email} · ${DEMO_CREDENTIALS.member.password} — tap to fill`} />
        </Pressable>
      ) : (
        <Pressable onPress={() => setMode("signin")} style={{ alignSelf: "center" }}>
          <Text style={styles.link}>I already have an account</Text>
        </Pressable>
      )}
      <Pressable testID="continue-guest" onPress={() => { dispatch({ type: "GUEST" }); router.replace("/"); }} style={{ alignSelf: "center", padding: 4 }}>
        <Text style={[styles.link, { color: C.muted }]}>Continue without an account</Text>
      </Pressable>
      <T v="caption" center>{BRAND.legalAgeNotice} Accounts in this demo are stored only on this device.</T>
    </View>
  );

  return (
    <Screen back={!isDesktop} hideNav testID="login-screen">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {isDesktop ? (
          <View style={styles.dwrap}>
            <Photo imageKey="loungeCocktails" style={styles.dphoto}>
              <View style={{ padding: 36 }}>
                <GoSipLogo size={34} align="flex-start" />
                <T v="h1" style={{ marginTop: 20, maxWidth: 380 }}>{BRAND.promise}</T>
              </View>
            </Photo>
            <View style={{ flex: 1, paddingHorizontal: 56, paddingVertical: 40, justifyContent: "center", maxWidth: 520 }}>{form}</View>
          </View>
        ) : (
          <View style={{ paddingTop: 4 }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <MartiniMark size={44} glow />
            </View>
            {form}
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: R.pill, padding: 4, borderWidth: 1, borderColor: C.lineSoft },
  segItem: { flex: 1, height: 40, borderRadius: R.pill, alignItems: "center", justifyContent: "center" },
  segActive: { backgroundColor: C.gold },
  segText: { fontFamily: F.semibold, fontSize: 13.5, color: C.ivoryDim },
  check: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.bronze, alignItems: "center", justifyContent: "center", marginTop: 1 },
  error: { fontFamily: F.medium, color: C.danger, fontSize: 13 },
  link: { fontFamily: F.semibold, color: C.gold, fontSize: 13.5, textDecorationLine: "underline" },
  dwrap: { flexDirection: "row", minHeight: 680, marginTop: 32, borderRadius: R.xl, overflow: "hidden", borderWidth: 1, borderColor: C.lineSoft, backgroundColor: C.deepNavy },
  dphoto: { flex: 1, minHeight: 680 },
});
