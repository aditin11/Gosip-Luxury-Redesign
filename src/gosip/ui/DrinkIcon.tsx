import React from "react";
import { Beer, CupSoda, GlassWater, Martini, Wine } from "lucide-react-native";
import type { DrinkCategory } from "../data/drinks";

const MAP = { CupSoda, GlassWater, Wine, Martini, Beer } as const;

export function DrinkIcon({ name, size = 18, color }: { name: DrinkCategory["icon"]; size?: number; color: string }) {
  const Icon = MAP[name];
  return <Icon size={size} color={color} />;
}
