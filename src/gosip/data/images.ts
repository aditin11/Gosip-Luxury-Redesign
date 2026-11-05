/**
 * Local hospitality imagery (bundled, works offline). Cropped from the
 * client's GoSip reference material. Remote photos are optional extras and
 * always fall back to these or to a gradient monogram.
 */
export const IMAGES = {
  skylineDusk: require("../../../assets/images/gosip/skyline-dusk.jpg"),
  skylineNight: require("../../../assets/images/gosip/skyline-night.jpg"),
  loungeCocktails: require("../../../assets/images/gosip/lounge-cocktails.jpg"),
  cocktailsTerrace: require("../../../assets/images/gosip/cocktails-terrace.jpg"),
  foodSignature: require("../../../assets/images/gosip/food-signature.jpg"),
  restaurantInterior: require("../../../assets/images/gosip/restaurant-interior.jpg"),
  beachSkyline: require("../../../assets/images/gosip/beach-skyline.jpg"),
  barCocktails: require("../../../assets/images/gosip/bar-cocktails.jpg"),
  palmLounge: require("../../../assets/images/gosip/palm-lounge.jpg"),
  skyLounge: require("../../../assets/images/gosip/sky-lounge.jpg"),
  beachBar: require("../../../assets/images/gosip/beach-bar.jpg"),
  palmTerrace: require("../../../assets/images/gosip/palm-terrace.jpg"),
} as const;

export type ImageKey = keyof typeof IMAGES;
