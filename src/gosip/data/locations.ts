export type CountryId = "uae" | "qatar" | "kuwait";

export interface City {
  id: string;
  name: string;
  nameAr: string;
  areas: string[];
}

export interface Country {
  id: CountryId;
  name: string;
  nameAr: string;
  currency: "AED" | "QAR" | "KWD";
  /** Fraction digits used for currency formatting. */
  currencyDecimals: number;
  dialCode: string;
  timezone: string;
  /** Fixed UTC offset (hours) — none of these countries observe DST. */
  utcOffset: number;
  status: "live" | "coming-soon";
  cities: City[];
}

export const COUNTRIES: Country[] = [
  {
    id: "uae",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    currency: "AED",
    currencyDecimals: 0,
    dialCode: "+971",
    timezone: "Asia/Dubai",
    utcOffset: 4,
    status: "live",
    cities: [
      {
        id: "dubai",
        name: "Dubai",
        nameAr: "دبي",
        areas: ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "DIFC", "Business Bay", "Jumeirah", "Bluewaters Island"],
      },
      {
        id: "abu-dhabi",
        name: "Abu Dhabi",
        nameAr: "أبوظبي",
        areas: ["Yas Island", "Saadiyat Island", "Al Maryah Island", "Corniche"],
      },
      { id: "sharjah", name: "Sharjah", nameAr: "الشارقة", areas: ["Al Majaz", "Aljada"] },
      { id: "ajman", name: "Ajman", nameAr: "عجمان", areas: ["Ajman Corniche"] },
      { id: "ras-al-khaimah", name: "Ras Al Khaimah", nameAr: "رأس الخيمة", areas: ["Al Marjan Island", "Al Hamra"] },
    ],
  },
  {
    id: "qatar",
    name: "Qatar",
    nameAr: "قطر",
    currency: "QAR",
    currencyDecimals: 0,
    dialCode: "+974",
    timezone: "Asia/Qatar",
    utcOffset: 3,
    status: "coming-soon",
    cities: [
      { id: "doha", name: "Doha", nameAr: "الدوحة", areas: ["West Bay", "The Pearl", "Msheireb"] },
      { id: "lusail", name: "Lusail", nameAr: "لوسيل", areas: ["Lusail Marina", "Place Vendôme"] },
    ],
  },
  {
    id: "kuwait",
    name: "Kuwait",
    nameAr: "الكويت",
    currency: "KWD",
    currencyDecimals: 3,
    dialCode: "+965",
    timezone: "Asia/Kuwait",
    utcOffset: 3,
    status: "coming-soon",
    cities: [{ id: "kuwait-city", name: "Kuwait City", nameAr: "مدينة الكويت", areas: ["Sharq", "Salmiya"] }],
  },
];

export const DEFAULT_COUNTRY: CountryId = "uae";
export const DEFAULT_CITY = "dubai";

export function getCountry(id: CountryId) {
  return COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0];
}

export function getCity(cityId: string) {
  for (const c of COUNTRIES) {
    const city = c.cities.find((x) => x.id === cityId);
    if (city) return { country: c, city };
  }
  return undefined;
}
