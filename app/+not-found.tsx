import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { MartiniMark } from "@/gosip/ui/Brand";
import { Button, T } from "@/gosip/ui/primitives";
import { Screen } from "@/gosip/ui/Shell";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: "Not found", headerShown: false }} />
      <Screen>
        <View style={{ alignItems: "center", gap: 14, paddingTop: 80 }}>
          <MartiniMark size={60} glow />
          <T v="display" center>This page isn't on the menu.</T>
          <T v="body" center>The page you're looking for doesn't exist.</T>
          <Button label="Back to GoSip" onPress={() => router.replace("/")} />
        </View>
      </Screen>
    </>
  );
}
