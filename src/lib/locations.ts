export interface Country {
  code: string
  nameAr: string
  nameEn: string
  cities: { nameAr: string; nameEn: string }[]
}

export const gulfCountries: Country[] = [
  {
    code: "SA",
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    cities: [
      { nameAr: "الرياض", nameEn: "Riyadh" },
      { nameAr: "جدة", nameEn: "Jeddah" },
      { nameAr: "مكة المكرمة", nameEn: "Mecca" },
      { nameAr: "المدينة المنورة", nameEn: "Medina" },
      { nameAr: "الدمام", nameEn: "Dammam" },
      { nameAr: "الخبر", nameEn: "Al Khobar" },
      { nameAr: "الظهران", nameEn: "Dhahran" },
      { nameAr: "الأحساء", nameEn: "Al Ahsa" },
      { nameAr: "تبوك", nameEn: "Tabuk" },
      { nameAr: "بريدة", nameEn: "Buraydah" },
      { nameAr: "حائل", nameEn: "Hail" },
      { nameAr: "نجران", nameEn: "Najran" },
      { nameAr: "جازان", nameEn: "Jazan" },
      { nameAr: "الطائف", nameEn: "Taif" },
      { nameAr: "ينبع", nameEn: "Yanbu" },
      { nameAr: "عرعر", nameEn: "Arar" },
      { nameAr: "سكاكا", nameEn: "Sakaka" },
      { nameAr: "أبها", nameEn: "Abha" },
      { nameAr: "خميس مشيط", nameEn: "Khamis Mushait" },
    ],
  },
  {
    code: "AE",
    nameAr: "الإمارات",
    nameEn: "UAE",
    cities: [
      { nameAr: "دبي", nameEn: "Dubai" },
      { nameAr: "أبو ظبي", nameEn: "Abu Dhabi" },
      { nameAr: "الشارقة", nameEn: "Sharjah" },
      { nameAr: "عجمان", nameEn: "Ajman" },
      { nameAr: "رأس الخيمة", nameEn: "Ras Al Khaimah" },
      { nameAr: "الفجيرة", nameEn: "Fujairah" },
      { nameAr: "أم القيوين", nameEn: "Umm Al Quwain" },
      { nameAr: "العين", nameEn: "Al Ain" },
    ],
  },
  {
    code: "QA",
    nameAr: "قطر",
    nameEn: "Qatar",
    cities: [
      { nameAr: "الدوحة", nameEn: "Doha" },
      { nameAr: "الريان", nameEn: "Al Rayyan" },
      { nameAr: "الوكرة", nameEn: "Al Wakrah" },
      { nameAr: "الخور", nameEn: "Al Khor" },
      { nameAr: "مسيعيد", nameEn: "Mesaieed" },
      { nameAr: "الشمال", nameEn: "Madinat Ash Shamal" },
    ],
  },
  {
    code: "OM",
    nameAr: "عمان",
    nameEn: "Oman",
    cities: [
      { nameAr: "مسقط", nameEn: "Muscat" },
      { nameAr: "صلالة", nameEn: "Salalah" },
      { nameAr: "صحار", nameEn: "Sohar" },
      { nameAr: "السيب", nameEn: "Seeb" },
      { nameAr: "نزوى", nameEn: "Nizwa" },
      { nameAr: "صور", nameEn: "Sur" },
      { nameAr: "عبري", nameEn: "Ibri" },
      { nameAr: "البريمي", nameEn: "Al Buraimi" },
      { nameAr: "إبراء", nameEn: "Ibra" },
      { nameAr: "بلاد بني بو علي", nameEn: "Bilad Bani Bu Ali" },
    ],
  },
  {
    code: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    cities: [
      { nameAr: "مدينة الكويت", nameEn: "Kuwait City" },
      { nameAr: "حولي", nameEn: "Hawalli" },
      { nameAr: "الفروانية", nameEn: "Al Farwaniyah" },
      { nameAr: "الأحمدي", nameEn: "Al Ahmadi" },
      { nameAr: "الجهراء", nameEn: "Al Jahra" },
      { nameAr: "مبارك الكبير", nameEn: "Mubarak Al Kabeer" },
      { nameAr: "السالمية", nameEn: "Salmiya" },
    ],
  },
  {
    code: "BH",
    nameAr: "البحرين",
    nameEn: "Bahrain",
    cities: [
      { nameAr: "المنامة", nameEn: "Manama" },
      { nameAr: "المحرق", nameEn: "Muharraq" },
      { nameAr: "الرفاع", nameEn: "Riffa" },
      { nameAr: "مدينة عيسى", nameEn: "Isa Town" },
      { nameAr: "سترة", nameEn: "Sitra" },
      { nameAr: "الحد", nameEn: "Hidd" },
    ],
  },
]

export function getCountryByCode(code: string) {
  return gulfCountries.find((c) => c.code === code)
}

export function getCitiesByCountryCode(code: string) {
  const country = getCountryByCode(code)
  return country ? country.cities : []
}
