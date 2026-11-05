/** SAMPLE OFFERS & EXPERIENCES — demonstration content only. */
import type { ImageKey } from "./images";
import type { PlanId } from "../config/plans";

export interface Experience {
  id: string;
  title: string;
  kind: "event" | "offer" | "experience";
  venueId: string;
  dateLabel: string;
  imageKey: ImageKey;
  description: string;
  plans: PlanId[];
  seatsLabel?: string;
}

export const EXPERIENCES: Experience[] = [
  {
    id: "sunset-sessions", title: "Sunset Sessions", kind: "event", venueId: "palm-lounge",
    dateLabel: "Every Friday · 17:00", imageKey: "palmTerrace",
    description: "Live saxophone and a member-only sunset terrace. Premium members can reserve a table in the app.",
    plans: ["premium"], seatsLabel: "24 member seats",
  },
  {
    id: "marina-cruise", title: "Golden-hour Marina Cruise", kind: "experience", venueId: "marina-sunset-cruise",
    dateLabel: "Thursdays · 17:00", imageKey: "skylineDusk",
    description: "Ninety minutes on the water with two complimentary drinks on board.",
    plans: ["premium"], seatsLabel: "12 seats weekly",
  },
  {
    id: "chefs-counter", title: "Chef's Counter Evening", kind: "experience", venueId: "gilded-room",
    dateLabel: "Wed · 19:30", imageKey: "foodSignature",
    description: "Seven-course counter dinner with the head chef. Member price shown at booking.",
    plans: ["basic", "premium"], seatsLabel: "8 seats",
  },
  {
    id: "ladies-night", title: "Tuesday Social Night", kind: "offer", venueId: "downtown-social",
    dateLabel: "Tuesdays · 20:00", imageKey: "cocktailsTerrace",
    description: "A third drink at member price after your two complimentary drinks.",
    plans: ["tourist", "basic", "premium"],
  },
  {
    id: "daybed-weekday", title: "Weekday Daybed Offer", kind: "offer", venueId: "beach-bar",
    dateLabel: "Mon–Thu", imageKey: "beachBar",
    description: "Discounted daybed entry for members on weekdays, subject to availability.",
    plans: ["tourist", "basic", "premium"],
  },
  {
    id: "skyline-dj", title: "Skyline DJ Thursdays", kind: "event", venueId: "sky-lounge",
    dateLabel: "Thursdays · 21:00", imageKey: "skyLounge",
    description: "Members skip the queue with guest-list access before 22:00.",
    plans: ["tourist", "basic", "premium"],
  },
];
