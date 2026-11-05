import { Redirect } from "expo-router";

/** Legacy route from the original app — now redirects into the GoSip experience. */
export default function LegacyDiningRedirect() {
  return <Redirect href="/venues?type=restaurant" />;
}
