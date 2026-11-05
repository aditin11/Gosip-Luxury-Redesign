import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MapPin, Search, X } from "lucide-react-native";
import { COUNTRIES, getCountry, type CountryId } from "@/gosip/data/locations";
import { VENUE_TYPES, type VenueType } from "@/gosip/data/venues";
import { useGoSip } from "@/gosip/store/GoSipProvider";
import { C, F, R } from "@/gosip/theme/tokens";
import { VenueCard } from "@/gosip/ui/Media";
import { Button, Chip, Grid, T, useLayout } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

function ChipRow({ children }: { children: React.ReactNode }) {
  const { gutter } = useLayout();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -gutter }} contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}>
      {children}
    </ScrollView>
  );
}

export default function Venues() {
  const params = useLocalSearchParams<{ type?: string; city?: string; country?: string; q?: string; focus?: string }>();
  const { state, dispatch, t, lang, isRTL, hydrated } = useGoSip();
  const { cols, isDesktop } = useLayout();
  const [q, setQ] = useState("");
  const [countryId, setCountryId] = useState<CountryId>(state.settings.countryId);
  const [cityId, setCityId] = useState<string | null>(state.settings.cityId);
  const [area, setArea] = useState<string | null>(null);
  const [type, setType] = useState<VenueType | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Query params are applied after mount (keeps static web hydration consistent)
  // and re-applied whenever the screen is opened with new params.
  useEffect(() => { if (params.q) setQ(params.q); }, [params.q]);
  // Restore the member's saved country/city once persisted state has loaded.
  useEffect(() => {
    if (hydrated && !params.city && !params.country) { setCountryId(state.settings.countryId); setCityId(state.settings.cityId); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  useEffect(() => { if (params.type) setType(params.type as VenueType); }, [params.type]);
  useEffect(() => { if (params.city) { setCityId(params.city); setArea(null); } }, [params.city]);
  useEffect(() => {
    if (params.country) { setCountryId(params.country as CountryId); setCityId(null); setArea(null); }
  }, [params.country]);
  useEffect(() => { if (params.focus) setTimeout(() => inputRef.current?.focus(), 250); }, [params.focus]);

  const country = getCountry(countryId);
  const city = country.cities.find((c) => c.id === cityId) ?? null;

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.venues
      .filter((v) => v.countryId === countryId)
      .filter((v) => (cityId ? v.cityId === cityId : true))
      .filter((v) => (area ? v.area === area : true))
      .filter((v) => (type ? v.type === type : true))
      .filter((v) => (needle ? `${v.name} ${v.area} ${v.type} ${v.description}`.toLowerCase().includes(needle) : true))
      .sort((a, b) => Number(b.active) - Number(a.active) || a.distanceKm - b.distanceKm);
  }, [state.venues, countryId, cityId, area, type, q]);

  const pickCountry = (id: CountryId) => {
    setCountryId(id);
    const first = getCountry(id).cities[0];
    setCityId(first.id);
    setArea(null);
    dispatch({ type: "SET_LOCATION", countryId: id, cityId: first.id });
  };
  const pickCity = (id: string | null) => {
    setCityId(id);
    setArea(null);
    if (id) dispatch({ type: "SET_LOCATION", countryId, cityId: id });
  };
  const reset = () => { setQ(""); setType(null); setArea(null); setCityId(null); };

  return (
    <Screen testID="venues-screen">
      <View style={{ paddingTop: isDesktop ? 28 : 8, gap: 14 }}>
        <View style={[styles.loc, isRTL && { flexDirection: "row-reverse" }]}>
          <MapPin size={16} color={C.gold} />
          <Text style={styles.locText}>{city ? (lang === "ar" ? city.nameAr : city.name) : (lang === "ar" ? country.nameAr : country.name)}</Text>
          <Text style={styles.locSub}>{country.currency} · {country.dialCode}</Text>
        </View>
        <T v="display">{t("venues.title")}</T>
        <View style={[styles.search, isRTL && { flexDirection: "row-reverse" }]}>
          <Search size={18} color={C.muted} />
          <TextInput
            ref={inputRef}
            testID="venue-search"
            value={q}
            onChangeText={setQ}
            placeholder={t("home.search")}
            placeholderTextColor={C.mutedDim}
            style={[styles.input, { outlineStyle: "none" } as any, isRTL && { textAlign: "right" }]}
            returnKeyType="search"
          />
          {q ? <Pressable onPress={() => setQ("")} accessibilityLabel="Clear search"><X size={16} color={C.muted} /></Pressable> : null}
        </View>

        <View style={{ gap: 10 }}>
          <T v="label">{t("venues.country")}</T>
          <ChipRow>
            {COUNTRIES.map((c) => (
              <Chip key={c.id} testID={`country-${c.id}`} label={`${lang === "ar" ? c.nameAr : c.name}${c.status === "coming-soon" ? " · soon" : ""}`} active={countryId === c.id} onPress={() => pickCountry(c.id)} />
            ))}
          </ChipRow>
          <T v="label">{t("venues.city")}</T>
          <ChipRow>
            <Chip label={t("common.all")} active={!cityId} onPress={() => pickCity(null)} />
            {country.cities.map((c) => (
              <Chip key={c.id} testID={`citychip-${c.id}`} label={lang === "ar" ? c.nameAr : c.name} active={cityId === c.id} onPress={() => pickCity(c.id)} />
            ))}
          </ChipRow>
          {city ? (
            <>
              <T v="label">{t("venues.area")}</T>
              <ChipRow>
                <Chip label={t("common.all")} active={!area} onPress={() => setArea(null)} />
                {city.areas.map((a) => <Chip key={a} testID={`area-${a}`} label={a} active={area === a} onPress={() => setArea(a)} />)}
              </ChipRow>
            </>
          ) : null}
          <T v="label">{t("venues.type")}</T>
          <ChipRow>
            <Chip label={t("common.all")} active={!type} onPress={() => setType(null)} />
            {VENUE_TYPES.map((vt) => <Chip key={vt.id} testID={`type-${vt.id}`} label={lang === "ar" ? vt.labelAr : vt.label} active={type === vt.id} onPress={() => setType(vt.id)} />)}
          </ChipRow>
        </View>

        <View style={[styles.countRow, isRTL && { flexDirection: "row-reverse" }]}>
          <T v="h2" testID="venue-count">{results.length} {results.length === 1 ? t("venues.result") : t("venues.results")}{cityId ? "" : ` · ${country.name}`}</T>
          {(q || type || area || !cityId) ? <Pressable onPress={reset}><Text style={styles.reset}>{t("venues.reset")}</Text></Pressable> : null}
        </View>

        {results.length ? (
          <Grid cols={cols(1, 2, 3)}>
            {results.map((v) => <VenueCard key={v.id} venue={v} variant="wide" testID={`venue-${v.id}`} />)}
          </Grid>
        ) : (
          <View style={styles.empty} testID="venues-empty">
            <T v="h3" center>{t("venues.empty")}</T>
            <T v="small" center>
              {country.status === "coming-soon" ? `${country.name} is launching soon — preview listings are shown as they are confirmed.` : "Try another area, type or search term."}
            </T>
            <Button label={t("venues.reset")} variant="outline" onPress={reset} style={{ alignSelf: "center" }} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loc: { flexDirection: "row", alignItems: "center", gap: 6 },
  locText: { fontFamily: F.semibold, fontSize: 14, color: C.ivory },
  locSub: { fontFamily: F.body, fontSize: 12, color: C.mutedDim, marginLeft: 6 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: R.pill, paddingHorizontal: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
  input: { flex: 1, height: "100%", color: C.ivory, fontFamily: F.body, fontSize: 14.5 },
  countRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  reset: { fontFamily: F.semibold, fontSize: 13, color: C.gold },
  empty: { padding: 28, gap: 12, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
});
