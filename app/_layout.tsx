import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";

import { GoSipProvider } from "@/gosip/store/GoSipProvider";
import { C } from "@/gosip/theme/tokens";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Splash → Onboarding → Tabs flow
  initialRouteName: "splash",
};

// Prevent the native splash screen from auto-hiding before fonts are loaded.
SplashScreen.preventAutoHideAsync();

const GoSipTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: C.midnight, card: C.midnight, primary: C.gold, text: C.ivory, border: C.lineSoft },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    SpaceGrotesk: SpaceGrotesk_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GoSipProvider>
      <ThemeProvider value={GoSipTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.midnight } }}>
          <Stack.Screen name="splash" options={{ animation: "none" }} />
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen name="login" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="packages" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="venue/[id]" />
          <Stack.Screen name="redeem/[venueId]" />
          <Stack.Screen name="usage" />
          <Stack.Screen name="offers" />
          <Stack.Screen name="security" />
          <Stack.Screen name="staff" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </GoSipProvider>
  );
}
