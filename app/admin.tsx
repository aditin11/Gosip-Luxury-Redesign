import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BarChart3, Building2, Crown, Gift, Globe, History, KeyRound, LayoutDashboard, LogOut, Martini, Pencil, Plus, Store, Users, Wallet } from "lucide-react-native";
import { TIER_LABEL, type MembershipPlan, type VenueTier } from "@/gosip/config/plans";
import { DEMO_CREDENTIALS } from "@/gosip/data/members";
import { DRINK_CATEGORIES, getDrinkCategory, type DrinkCategoryId } from "@/gosip/data/drinks";
import { COUNTRIES, getCity } from "@/gosip/data/locations";
import { VENUE_TYPES, VENUE_TYPE_SINGULAR, type Venue, type VenueType } from "@/gosip/data/venues";
import type { ImageKey } from "@/gosip/data/images";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { effectiveStatus } from "@/gosip/store/redemption";
import { C, F, R } from "@/gosip/theme/tokens";
import { dayKey, formatDate, formatDateTime, formatMoney, prettyCode, DAY } from "@/gosip/utils/format";
import { GoSipLogo } from "@/gosip/ui/Brand";
import { Badge, Button, Card, Chip, DemoNotice, Field, Stat, T, Toggle, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";
import { DrinkIcon } from "@/gosip/ui/DrinkIcon";

type Section = "overview" | "locations" | "venues" | "members" | "plans" | "benefits" | "categories" | "codes" | "history" | "usage" | "revenue";
const SECTIONS: { id: Section; label: string; Icon: typeof Users }[] = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "locations", label: "Countries & cities", Icon: Globe },
  { id: "venues", label: "Venues", Icon: Store },
  { id: "members", label: "Members", Icon: Users },
  { id: "plans", label: "Membership plans", Icon: Crown },
  { id: "benefits", label: "Benefits", Icon: Gift },
  { id: "categories", label: "Drink categories", Icon: Martini },
  { id: "codes", label: "Redemption codes", Icon: KeyRound },
  { id: "history", label: "Redemption history", Icon: History },
  { id: "usage", label: "Usage statistics", Icon: BarChart3 },
  { id: "revenue", label: "Revenue (demo)", Icon: Wallet },
];

function AdminLogin() {
  const { dispatch } = useGoSip();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = () => {
    if (email.trim().toLowerCase() === DEMO_CREDENTIALS.admin.email && pw === DEMO_CREDENTIALS.admin.password) dispatch({ type: "ADMIN_LOGIN" });
    else setErr("Use the demo admin credentials shown below.");
  };
  return (
    <Screen title="Admin dashboard" back hideNav maxWidth={560} testID="admin-login">
      <View style={{ alignItems: "center", marginVertical: 16, gap: 8 }}>
        <GoSipLogo size={30} />
        <Badge label="Operations console" tone="gold" />
      </View>
      <Card style={{ gap: 12 }}>
        <Field testID="admin-email" placeholder="Admin email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field testID="admin-password" placeholder="Password" value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
        {err ? <Text style={{ color: C.danger, fontFamily: F.medium }}>{err}</Text> : null}
        <Button testID="admin-login-submit" label="Sign in" size="lg" full onPress={submit} />
        <Pressable testID="admin-fill" onPress={() => { setEmail(DEMO_CREDENTIALS.admin.email); setPw(DEMO_CREDENTIALS.admin.password); }}>
          <DemoNotice text={`Demo admin: ${DEMO_CREDENTIALS.admin.email} · ${DEMO_CREDENTIALS.admin.password} — tap to fill. Changes are saved on this device only and never touch a backend.`} />
        </Pressable>
      </Card>
    </Screen>
  );
}

function Table({ head, rows, widths }: { head: string[]; rows: React.ReactNode[][]; widths?: number[] }) {
  const w = widths ?? head.map(() => 1);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, { minWidth: Math.max(640, head.length * 120) }]}>
        <View style={[styles.tr, styles.thead]}>
          {head.map((h, i) => <Text key={h} style={[styles.th, { flex: w[i] }]}>{h}</Text>)}
        </View>
        {rows.map((r, ri) => (
          <View key={ri} style={[styles.tr, ri % 2 === 1 && { backgroundColor: "rgba(255,255,255,0.02)" }]}>
            {r.map((c, ci) => (
              <View key={ci} style={{ flex: w[ci], paddingRight: 8 }}>
                {typeof c === "string" || typeof c === "number" ? <Text style={styles.td} numberOfLines={2}>{c}</Text> : c}
              </View>
            ))}
          </View>
        ))}
        {!rows.length ? <Text style={[styles.td, { padding: 16 }]}>No records.</Text> : null}
      </View>
    </ScrollView>
  );
}

const IMAGE_CHOICES: ImageKey[] = ["cocktailsTerrace", "loungeCocktails", "skyLounge", "beachBar", "restaurantInterior", "foodSignature", "palmTerrace", "skylineNight"];

function VenueEditor({ initial, onClose }: { initial?: Venue; onClose: () => void }) {
  const { dispatch } = useGoSip();
  const blank: Venue = {
    id: `demo-${Date.now().toString(36)}`, name: "", type: "bar", tier: "standard", countryId: "uae", cityId: "dubai", area: "Downtown Dubai",
    rating: 4.5, distanceKm: 1.0, imageKey: "cocktailsTerrace", gallery: ["cocktailsTerrace"], tint: ["#3A2A1A", "#120C08"],
    description: "", benefits: ["2 complimentary drinks daily", "20% off food"], drinkCategories: ["soft", "spirits", "cocktails"],
    foodDiscountPercent: 20, foodExclusions: [], hours: [{ days: "Daily", open: "16:00", close: "01:00" }], memberHours: "Member drinks 16:00–21:00 daily",
    dressCode: "Smart casual", entryRequirements: ["Valid photo ID for alcoholic drinks", "Active GoSip membership on the member's phone"],
    accessConditions: ["Subject to venue capacity"], restrictions: ["Benefits cannot be combined with other offers"], address: "Sample address", phone: "+971 4 000 0000",
    active: true, isSample: true, staffPin: String(2000 + Math.floor(Math.random() * 7000)),
  };
  const [v, setV] = useState<Venue>(initial ?? blank);
  const [err, setErr] = useState<string | null>(null);
  const set = (patch: Partial<Venue>) => setV((x) => ({ ...x, ...patch }));
  const country = COUNTRIES.find((c) => c.id === v.countryId)!;
  const city = country.cities.find((c) => c.id === v.cityId) ?? country.cities[0];
  const toggleCat = (id: DrinkCategoryId) => set({ drinkCategories: v.drinkCategories.includes(id) ? v.drinkCategories.filter((x) => x !== id) : [...v.drinkCategories, id] });
  const save = () => {
    if (v.name.trim().length < 2) return setErr("Venue name is required.");
    if (!v.drinkCategories.length) return setErr("Select at least one drink category.");
    dispatch({ type: "UPSERT_VENUE", venue: { ...v, name: v.name.trim(), description: v.description || `${v.name} — demonstration venue.`, gallery: [v.imageKey] } });
    onClose();
  };
  return (
    <Card tone="raised" style={{ gap: 12, marginBottom: 16 }}>
      <T v="h2">{initial ? `Edit ${initial.name}` : "Add demonstration venue"}</T>
      <Field testID="venue-name" label="Venue name" value={v.name} onChangeText={(name) => set({ name })} placeholder="e.g. Harbour Social" />
      <T v="small">Type</T>
      <View style={styles.wrap}>{VENUE_TYPES.map((t) => <Chip key={t.id} label={VENUE_TYPE_SINGULAR[t.id]} active={v.type === t.id} onPress={() => set({ type: t.id as VenueType })} />)}</View>
      <T v="small">Tier</T>
      <View style={styles.wrap}>{(["standard", "signature", "premium"] as VenueTier[]).map((t) => <Chip key={t} label={TIER_LABEL[t]} active={v.tier === t} onPress={() => set({ tier: t })} />)}</View>
      <T v="small">Country / city / area</T>
      <View style={styles.wrap}>{COUNTRIES.map((c) => <Chip key={c.id} label={c.name} active={v.countryId === c.id} onPress={() => set({ countryId: c.id, cityId: c.cities[0].id, area: c.cities[0].areas[0] })} />)}</View>
      <View style={styles.wrap}>{country.cities.map((c) => <Chip key={c.id} label={c.name} active={v.cityId === c.id} onPress={() => set({ cityId: c.id, area: c.areas[0] })} />)}</View>
      <View style={styles.wrap}>{city.areas.map((a) => <Chip key={a} label={a} active={v.area === a} onPress={() => set({ area: a })} />)}</View>
      <Field label="Description" value={v.description} onChangeText={(description) => set({ description })} placeholder="Short description" />
      <Field label="Member hours" value={v.memberHours} onChangeText={(memberHours) => set({ memberHours })} />
      <Field label="Dress code" value={v.dressCode} onChangeText={(dressCode) => set({ dressCode })} />
      <Field label="Benefits (comma separated)" value={v.benefits.join(", ")} onChangeText={(x) => set({ benefits: x.split(",").map((s) => s.trim()).filter(Boolean) })} />
      <Field label="Food discount %" value={String(v.foodDiscountPercent)} keyboardType="number-pad" onChangeText={(x) => set({ foodDiscountPercent: Math.min(100, Number(x.replace(/\D/g, "")) || 0) })} />
      <T v="small">Drink categories served</T>
      <View style={styles.wrap}>{DRINK_CATEGORIES.map((c) => <Chip key={c.id} label={c.name} active={v.drinkCategories.includes(c.id)} onPress={() => toggleCat(c.id)} />)}</View>
      <T v="small">Photo</T>
      <View style={styles.wrap}>{IMAGE_CHOICES.map((k) => <Chip key={k} label={k} active={v.imageKey === k} onPress={() => set({ imageKey: k })} />)}</View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <T v="bodyStrong">Available for redemption</T>
        <Toggle value={v.active} onChange={(active) => set({ active })} />
      </View>
      {err ? <Text style={{ color: C.danger, fontFamily: F.medium }}>{err}</Text> : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button testID="venue-save" label="Save venue" onPress={save} />
        <Button label="Cancel" variant="ghost" onPress={onClose} />
      </View>
    </Card>
  );
}

function PlanEditor({ plan }: { plan: MembershipPlan }) {
  const { dispatch } = useGoSip();
  const [price, setPrice] = useState(String(plan.priceAED));
  const [food, setFood] = useState(String(plan.foodDiscountPercent));
  const toggle = (id: DrinkCategoryId) =>
    dispatch({ type: "UPDATE_PLAN", id: plan.id, patch: { drinkCategories: plan.drinkCategories.includes(id) ? plan.drinkCategories.filter((x) => x !== id) : [...plan.drinkCategories, id] } });
  return (
    <Card style={{ gap: 10, flex: 1, minWidth: 260 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T v="h2">{plan.name}</T>
        <Badge label={plan.durationLabel} tone="gold" />
      </View>
      <Field testID={`plan-price-${plan.id}`} label="Price (AED, VAT inclusive)" value={price} keyboardType="number-pad" onChangeText={(x) => setPrice(x.replace(/\D/g, ""))} />
      <Field label="Food discount %" value={food} keyboardType="number-pad" onChangeText={(x) => setFood(x.replace(/\D/g, ""))} />
      <T v="small">Drink categories</T>
      <View style={styles.wrap}>{DRINK_CATEGORIES.map((c) => <Chip key={c.id} label={c.name} active={plan.drinkCategories.includes(c.id)} onPress={() => toggle(c.id)} />)}</View>
      <T v="caption">Venue allocation limit: {formatMoney(plan.venueAllocationAED)} per verified day · {plan.venueTiers.map((x) => TIER_LABEL[x]).join(", ")} venues</T>
      <Button testID={`plan-save-${plan.id}`} label="Save plan" size="sm" onPress={() => dispatch({ type: "UPDATE_PLAN", id: plan.id, patch: { priceAED: Number(price) || plan.priceAED, foodDiscountPercent: Math.min(100, Number(food) || 0) } })} />
    </Card>
  );
}

export default function Admin() {
  const router = useRouter();
  const { state, dispatch, venueById, memberById } = useGoSip();
  const { isDesktop } = useLayout();
  const [section, setSection] = useState<Section>("overview");
  const [editing, setEditing] = useState<Venue | "new" | null>(null);
  const now = Date.now();

  const stats = useMemo(() => {
    const today = dayKey(now);
    const redeemed = state.redemptions.filter((r) => effectiveStatus(r, now) === "redeemed");
    const todayR = redeemed.filter((r) => r.redeemedAt && dayKey(r.redeemedAt) === today);
    const activeMembers = state.members.filter((m) => m.status === "active" && m.expiryDate && Date.parse(m.expiryDate) > now);
    const byVenue = state.venues.map((v) => ({ v, n: redeemed.filter((r) => r.venueId === v.id).length })).sort((a, b) => b.n - a.n);
    const byCat = DRINK_CATEGORIES.map((c) => ({ c, n: redeemed.filter((r) => r.categoryId === c.id).length }));
    const byPlan = state.plans.map((p) => ({ p, n: activeMembers.filter((m) => m.planId === p.id).length }));
    const sampleRevenue = state.members.filter((m) => m.planId).reduce((s, m) => s + (state.plans.find((p) => p.id === m.planId)?.priceAED ?? 0), 0);
    const demoPayments = state.payments.filter((p) => p.outcome === "demo-confirmed").reduce((s, p) => s + p.amountAED, 0);
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const k = dayKey(now - (6 - i) * DAY);
      return { k, n: redeemed.filter((r) => r.redeemedAt && dayKey(r.redeemedAt) === k).length };
    });
    return { redeemed, todayR, activeMembers, byVenue, byCat, byPlan, sampleRevenue, demoPayments, last7, pending: state.redemptions.filter((r) => effectiveStatus(r, now) === "pending") };
  }, [state, now]);

  if (!state.adminSignedIn) return <AdminLogin />;

  const content = (() => {
    switch (section) {
      case "overview": {
        const max = Math.max(1, ...stats.last7.map((d) => d.n));
        return (
          <View style={{ gap: 16 }}>
            <View style={styles.statGrid}>
              <Card style={styles.statCard}><Stat value={String(stats.activeMembers.length)} label="Active members" accent /></Card>
              <Card style={styles.statCard}><Stat value={String(stats.todayR.length)} label="Redemptions today" /></Card>
              <Card style={styles.statCard}><Stat value={String(state.venues.filter((v) => v.active).length)} label={`Live venues of ${state.venues.length}`} /></Card>
              <Card style={styles.statCard}><Stat value={String(stats.pending.length)} label="Open redemption codes" /></Card>
            </View>
            <Card>
              <T v="label">Redemptions · last 7 days</T>
              <View style={styles.chart}>
                {stats.last7.map((d) => (
                  <View key={d.k} style={styles.barCol}>
                    <Text style={styles.barN}>{d.n}</Text>
                    <View style={styles.barTrack}><View style={[styles.bar, { height: `${(d.n / max) * 100}%` }]} /></View>
                    <Text style={styles.barL}>{d.k.slice(5)}</Text>
                  </View>
                ))}
              </View>
            </Card>
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
              <Card style={{ flex: 1, gap: 8 }}>
                <T v="label">Members by plan</T>
                {stats.byPlan.map(({ p, n }) => <View key={p.id} style={styles.kv}><T v="small">{p.name}</T><T v="bodyStrong">{n}</T></View>)}
              </Card>
              <Card style={{ flex: 1, gap: 8 }}>
                <T v="label">Top venues</T>
                {stats.byVenue.slice(0, 5).map(({ v, n }) => <View key={v.id} style={styles.kv}><T v="small">{v.name}</T><T v="bodyStrong">{n}</T></View>)}
              </Card>
            </View>
          </View>
        );
      }
      case "locations":
        return (
          <View style={{ gap: 16 }}>
            {COUNTRIES.map((c) => (
              <Card key={c.id} style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <T v="h2">{c.name}</T>
                  <Badge label={c.status === "live" ? "Live" : "Coming soon"} tone={c.status === "live" ? "success" : "muted"} />
                  <Badge label={`${c.currency} · ${c.dialCode} · ${c.timezone}`} tone="gold" />
                </View>
                <Table
                  head={["City", "Areas", "Venues"]}
                  widths={[1, 3, 0.6]}
                  rows={c.cities.map((city) => [city.name, city.areas.join(", "), String(state.venues.filter((v) => v.cityId === city.id).length)])}
                />
              </Card>
            ))}
          </View>
        );
      case "venues":
        return (
          <View>
            {editing ? <VenueEditor initial={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} /> : (
              <Button testID="add-venue" label="Add demonstration venue" icon={<Plus size={16} color={C.ink} />} onPress={() => setEditing("new")} style={{ marginBottom: 16 }} />
            )}
            <Table
              head={["Venue", "Type / tier", "Location", "Categories", "Available", ""]}
              widths={[1.4, 1, 1.4, 1.6, 0.8, 0.6]}
              rows={state.venues.map((v) => [
                <View key="n"><Text style={styles.tdStrong}>{v.name}</Text><Text style={styles.tdSub}>PIN {v.staffPin}</Text></View>,
                `${VENUE_TYPE_SINGULAR[v.type]} · ${TIER_LABEL[v.tier]}`,
                `${v.area}, ${getCity(v.cityId)?.city.name ?? ""}`,
                v.drinkCategories.map((c) => getDrinkCategory(c).name).join(", "),
                <Toggle key="t" testID={`venue-active-${v.id}`} value={v.active} onChange={() => dispatch({ type: "TOGGLE_VENUE_ACTIVE", id: v.id })} />,
                <Pressable key="e" testID={`edit-${v.id}`} onPress={() => setEditing(v)} style={styles.iconBtn}><Pencil size={15} color={C.gold} /></Pressable>,
              ])}
            />
          </View>
        );
      case "members":
        return (
          <Table
            head={["Member", "Member ID", "Plan", "Status", "Expiry", "Redemptions"]}
            widths={[1.3, 1.2, 0.8, 0.8, 1, 0.8]}
            rows={state.members.map((m) => [
              <View key="n"><Text style={styles.tdStrong}>{m.name}</Text><Text style={styles.tdSub}>{m.email}</Text></View>,
              m.id,
              state.plans.find((p) => p.id === m.planId)?.shortName ?? "—",
              <Badge key="s" label={m.status} tone={m.status === "active" ? "success" : "muted"} />,
              m.expiryDate ? formatDate(m.expiryDate) : "—",
              String(state.redemptions.filter((r) => r.memberId === m.id && r.status === "redeemed").length),
            ])}
          />
        );
      case "plans":
        return (
          <View style={{ gap: 12 }}>
            <DemoNotice text="Edits change this device's demonstration data only. Official pricing lives in src/gosip/config/plans.ts." />
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>{state.plans.map((p) => <PlanEditor key={p.id} plan={p} />)}</View>
          </View>
        );
      case "benefits":
        return (
          <View style={{ gap: 12 }}>
            <DemoNotice text="Manage sample venue benefits. Edit a venue to change its benefit list, food discount and drink categories." />
            <Table
              head={["Venue", "Benefits", "Food discount", "Exclusions", ""]}
              widths={[1.2, 2.2, 0.8, 1.4, 0.5]}
              rows={state.venues.map((v) => [
                v.name, v.benefits.join(" · "), v.foodDiscountPercent ? `${v.foodDiscountPercent}%` : "—", v.foodExclusions.join(", ") || "—",
                <Pressable key="e" onPress={() => { setSection("venues"); setEditing(v); }} style={styles.iconBtn}><Pencil size={15} color={C.gold} /></Pressable>,
              ])}
            />
          </View>
        );
      case "categories":
        return (
          <Table
            head={["Category", "Age restricted", ...state.plans.map((p) => p.shortName), "Venues serving"]}
            rows={DRINK_CATEGORIES.map((c) => [
              <View key="c" style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><DrinkIcon name={c.icon} size={15} color={C.gold} /><Text style={styles.tdStrong}>{c.name}</Text></View>,
              c.ageRestricted ? "Yes — photo ID" : "No",
              ...state.plans.map((p) => (p.drinkCategories.includes(c.id) ? "Included" : "—")),
              String(state.venues.filter((v) => v.drinkCategories.includes(c.id)).length),
            ])}
          />
        );
      case "codes":
        return (
          <View style={{ gap: 12 }}>
            <DemoNotice text="Codes are generated and validated locally for demonstration. Production must issue, sign and verify codes on the backend." />
            <Table
              head={["Code", "Venue", "Member", "Benefit", "Expires", "Status"]}
              rows={state.redemptions.filter((r) => ["pending", "expired", "cancelled"].includes(effectiveStatus(r, now))).sort((a, b) => b.createdAt - a.createdAt).slice(0, 40).map((r) => {
                const st = effectiveStatus(r, now);
                return [
                  <Text key="c" style={[styles.tdStrong, { letterSpacing: 1.2 }]}>{prettyCode(r.code)}</Text>,
                  venueById(r.venueId)?.name ?? r.venueId,
                  memberById(r.memberId)?.name ?? r.memberId,
                  getDrinkCategory(r.categoryId).name,
                  formatDateTime(r.expiresAt),
                  <Badge key="s" label={st} tone={st === "pending" ? "gold" : "muted"} />,
                ];
              })}
            />
          </View>
        );
      case "history":
        return (
          <Table
            head={["Redeemed", "Venue", "Member", "Category", "Code"]}
            rows={[...stats.redeemed].sort((a, b) => (b.redeemedAt ?? 0) - (a.redeemedAt ?? 0)).slice(0, 60).map((r) => [
              formatDateTime(r.redeemedAt ?? r.createdAt), venueById(r.venueId)?.name ?? r.venueId, memberById(r.memberId)?.name ?? r.memberId, getDrinkCategory(r.categoryId).name, prettyCode(r.code),
            ])}
          />
        );
      case "usage":
        return (
          <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
            <Card style={{ flex: 1, gap: 8 }}>
              <T v="label">Redemptions by venue</T>
              {stats.byVenue.map(({ v, n }) => (
                <View key={v.id} style={{ gap: 4 }}>
                  <View style={styles.kv}><T v="small">{v.name}</T><T v="bodyStrong" style={{ fontSize: 14 }}>{n}</T></View>
                  <View style={styles.hbarTrack}><View style={[styles.hbar, { width: `${(n / Math.max(1, stats.byVenue[0].n)) * 100}%` }]} /></View>
                </View>
              ))}
            </Card>
            <Card style={{ flex: 1, gap: 8 }}>
              <T v="label">Redemptions by category</T>
              {stats.byCat.map(({ c, n }) => <View key={c.id} style={styles.kv}><T v="small">{c.name}</T><T v="bodyStrong" style={{ fontSize: 14 }}>{n}</T></View>)}
              <T v="caption" style={{ marginTop: 8 }}>Total redeemed (sample + demo): {stats.redeemed.length}</T>
            </Card>
          </View>
        );
      case "revenue":
        return (
          <View style={{ gap: 16 }}>
            <DemoNotice text="Demonstration statistics computed from sample member records and simulated checkouts. These are not financial results or projections." />
            <View style={styles.statGrid}>
              <Card style={styles.statCard}><Stat value={formatMoney(stats.sampleRevenue)} label="Sample membership value" accent /></Card>
              <Card style={styles.statCard}><Stat value={formatMoney(stats.demoPayments)} label="Simulated checkouts (this device)" /></Card>
              <Card style={styles.statCard}><Stat value={String(state.payments.length)} label="Demo payment attempts" /></Card>
            </View>
            <Table
              head={["Plan", "Price", "Sample members", "Sample value"]}
              rows={state.plans.map((p) => {
                const n = state.members.filter((m) => m.planId === p.id).length;
                return [p.name, formatMoney(p.priceAED), String(n), formatMoney(n * p.priceAED)];
              })}
            />
          </View>
        );
    }
  })();

  const nav = (
    <View style={isDesktop ? styles.side : undefined}>
      {isDesktop ? (
        SECTIONS.map((s) => (
          <Pressable key={s.id} testID={`admin-nav-${s.id}`} onPress={() => { setSection(s.id); setEditing(null); }} style={[styles.sideItem, section === s.id && styles.sideActive]}>
            <s.Icon size={16} color={section === s.id ? C.ink : C.gold} />
            <Text style={[styles.sideT, section === s.id && { color: C.ink }]}>{s.label}</Text>
          </Pressable>
        ))
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {SECTIONS.map((s) => <Chip key={s.id} testID={`admin-nav-${s.id}`} label={s.label} active={section === s.id} onPress={() => { setSection(s.id); setEditing(null); }} />)}
        </ScrollView>
      )}
    </View>
  );

  return (
    <Screen hideNav testID="admin-dashboard" maxWidth={1320}>
      <View style={[styles.top, { marginTop: isDesktop ? 24 : 8 }]}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <GoSipLogo size={22} showTagline={false} align="flex-start" />
          <View style={{ flex: 1 }}>
            <T v="label">Admin dashboard · demo</T>
            <T v="h2">{SECTIONS.find((s) => s.id === section)?.label}</T>
          </View>
        </View>
        <Button label="Customer app" size="sm" variant="ghost" icon={<Building2 size={14} color={C.gold} />} onPress={() => router.push("/")} />
        <Button testID="admin-logout" label="Sign out" size="sm" variant="outline" icon={<LogOut size={14} color={C.gold} />} onPress={() => dispatch({ type: "ADMIN_LOGOUT" })} />
      </View>
      <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 20, marginTop: 18 }}>
        {nav}
        <View style={{ flex: 1, minWidth: 0 }}>{content}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  side: { width: 230, gap: 4 },
  sideItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, height: 40, borderRadius: R.md },
  sideActive: { backgroundColor: C.gold },
  sideT: { fontFamily: F.medium, fontSize: 13.5, color: C.ivoryDim },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { flexGrow: 1, flexBasis: 180 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 160, gap: 10, marginTop: 14 },
  barCol: { flex: 1, alignItems: "center", gap: 6, height: "100%" },
  barTrack: { flex: 1, width: "60%", maxWidth: 34, justifyContent: "flex-end", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 6, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: C.gold, borderRadius: 6 },
  barN: { fontFamily: F.semibold, fontSize: 11, color: C.ivory },
  barL: { fontFamily: F.body, fontSize: 10.5, color: C.mutedDim },
  kv: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  table: { borderRadius: R.lg, borderWidth: 1, borderColor: C.lineSoft, overflow: "hidden", backgroundColor: C.card, flex: 1 },
  thead: { backgroundColor: C.cardRaised },
  tr: { flexDirection: "row", alignItems: "center", minHeight: 48, paddingHorizontal: 14, paddingVertical: 6 },
  th: { fontFamily: F.semibold, fontSize: 11.5, color: C.gold, letterSpacing: 1, textTransform: "uppercase" },
  td: { fontFamily: F.body, fontSize: 13, color: C.ivoryDim },
  tdStrong: { fontFamily: F.semibold, fontSize: 13, color: C.ivory },
  tdSub: { fontFamily: F.body, fontSize: 11.5, color: C.mutedDim },
  iconBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hbarTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  hbar: { height: 6, borderRadius: 3, backgroundColor: C.gold },
});
