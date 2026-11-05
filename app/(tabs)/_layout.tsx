import React from "react";
import { Tabs } from "expo-router";
import { GoSipTabBar } from "@/gosip/ui/Shell";
import { C } from "@/gosip/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GoSipTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: "fade", sceneStyle: { backgroundColor: C.midnight } }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="venues" options={{ title: "Venues" }} />
      <Tabs.Screen name="drinks" options={{ title: "My Drinks" }} />
      <Tabs.Screen name="card" options={{ title: "My Card" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      {/* Legacy routes kept so old links still resolve — they redirect into GoSip screens. */}
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="location" options={{ href: null }} />
      <Tabs.Screen name="event" options={{ href: null }} />
      <Tabs.Screen name="dining" options={{ href: null }} />
      <Tabs.Screen name="movies" options={{ href: null }} />
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="ipl" options={{ href: null }} />
      <Tabs.Screen name="stores" options={{ href: null }} />
      <Tabs.Screen name="activities" options={{ href: null }} />
    </Tabs>
  );
}
