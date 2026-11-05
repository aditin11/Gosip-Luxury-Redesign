import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Heart, MapPin, Star } from "lucide-react-native";
import { IMAGES, type ImageKey } from "../data/images";
import { TIER_LABEL } from "../config/plans";
import { VENUE_TYPE_SINGULAR, type Venue } from "../data/venues";
import { C, F, R } from "../theme/tokens";
import { useGoSip } from "../store/GoSipProvider";
import { Badge, T } from "./primitives";

/**
 * Photo with a graceful fallback: if the image is missing or fails to load,
 * a tinted gradient with the venue monogram is shown instead.
 */
export function Photo({
  imageKey,
  source,
  tint = [C.deepNavy, C.midnight],
  monogram,
  style,
  overlay = true,
  children,
}: {
  imageKey?: ImageKey;
  source?: ImageSourcePropType;
  tint?: [string, string];
  monogram?: string;
  style?: StyleProp<ViewStyle>;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const src = source ?? (imageKey ? IMAGES[imageKey] : undefined);
  return (
    <View style={[styles.photo, style]}>
      <LinearGradient colors={tint} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      {src && !failed ? (
        <Image source={src} onError={() => setFailed(true)} style={FILL_IMAGE} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : monogram ? (
        <Text style={styles.monogram}>{monogram}</Text>
      ) : null}
      {overlay ? (
        <LinearGradient colors={["rgba(7,19,33,0)", "rgba(7,19,33,0.25)", "rgba(7,19,33,0.92)"]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      ) : null}
      {children}
    </View>
  );
}

export function monogramOf(name: string) {
  return name
    .replace(/^The\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function VenueCard({ venue, variant = "tile", testID }: { venue: Venue; variant?: "tile" | "wide" | "row"; testID?: string }) {
  const router = useRouter();
  const { state, dispatch, t } = useGoSip();
  const saved = state.savedVenueIds.includes(venue.id);
  const open = () => router.push({ pathname: "/venue/[id]", params: { id: venue.id } });
  const typeLabel = VENUE_TYPE_SINGULAR[venue.type];

  if (variant === "row") {
    return (
      <Pressable testID={testID} onPress={open} style={({ hovered }: any) => [styles.rowCard, hovered && styles.hover]}>
        <Photo imageKey={venue.imageKey} tint={venue.tint} monogram={monogramOf(venue.name)} style={{ width: 88, height: 88, borderRadius: R.md }} overlay={false} />
        <View style={{ flex: 1, gap: 4 }}>
          <T v="h3">{venue.name}</T>
          <T v="small">{typeLabel} · {venue.area}</T>
          <View style={styles.meta}>
            <Star size={12} color={C.gold} fill={C.gold} />
            <Text style={styles.metaText}>{venue.rating.toFixed(1)}</Text>
            <MapPin size={12} color={C.muted} />
            <Text style={styles.metaText}>{venue.distanceKm} km</Text>
          </View>
        </View>
        <Badge label={TIER_LABEL[venue.tier]} tone={venue.tier === "premium" ? "solid" : "gold"} />
      </Pressable>
    );
  }

  const tall = variant === "wide";
  return (
    <Pressable testID={testID} onPress={open} accessibilityRole="link" accessibilityLabel={venue.name} style={({ hovered }: any) => [styles.tile, hovered && styles.hover]}>
      <Photo imageKey={venue.imageKey} tint={venue.tint} monogram={monogramOf(venue.name)} style={{ height: tall ? 210 : 150 }}>
        <View style={styles.tileTop}>
          <Badge label={TIER_LABEL[venue.tier]} tone={venue.tier === "premium" ? "solid" : "gold"} />
          <Pressable
            hitSlop={8}
            accessibilityLabel={saved ? "Remove from saved" : "Save venue"}
            onPress={(e: any) => { e?.stopPropagation?.(); dispatch({ type: "TOGGLE_SAVED", venueId: venue.id }); }}
            style={styles.heart}
          >
            <Heart size={16} color={saved ? C.gold : C.ivory} fill={saved ? C.gold : "transparent"} />
          </Pressable>
        </View>
        <View style={styles.tileBottom}>
          <Badge label={`${venue.benefits.length} benefits for you`} tone="gold" style={{ backgroundColor: "rgba(7,19,33,0.65)" }} />
        </View>
      </Photo>
      <View style={{ padding: 14, gap: 4 }}>
        <T v="h3" numberOfLines={1}>{venue.name}</T>
        <T v="small" numberOfLines={1}>{typeLabel} · {venue.area}</T>
        <View style={[styles.meta, { marginTop: 4 }]}>
          <Star size={12} color={C.gold} fill={C.gold} />
          <Text style={styles.metaText}>{venue.rating.toFixed(1)}</Text>
          <MapPin size={12} color={C.muted} />
          <Text style={styles.metaText}>{venue.distanceKm} km</Text>
          {!venue.active ? <Badge label="Coming soon" tone="muted" /> : <Text style={[styles.metaText, { color: C.success }]}>● {t("common.openNow")}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

/** Plain (non-StyleSheet) object so RN Web applies it inline and it overrides the asset's intrinsic size. */
const FILL_IMAGE = { position: "absolute" as const, top: 0, left: 0, width: "100%" as const, height: "100%" as const };

const styles = StyleSheet.create({
  photo: { overflow: "hidden", backgroundColor: C.deepNavy, justifyContent: "flex-end" },
  monogram: { position: "absolute", left: 16, bottom: 14, fontFamily: F.bold, fontSize: 40, color: "rgba(246,241,231,0.9)", letterSpacing: 1 },
  tile: { backgroundColor: C.card, borderRadius: R.lg, overflow: "hidden", borderWidth: 1, borderColor: C.lineSoft },
  hover: { borderColor: C.line, transform: [{ translateY: -2 }] },
  tileTop: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tileBottom: { padding: 12 },
  heart: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(7,19,33,0.55)", alignItems: "center", justifyContent: "center" },
  meta: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  metaText: { fontFamily: F.medium, fontSize: 12, color: C.muted, marginRight: 6 },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.lineSoft },
});
