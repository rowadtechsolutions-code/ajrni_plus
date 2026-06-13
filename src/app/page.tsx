"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, MapPin, Calendar, Car, TrendingUp, Star, Shield, Zap, ChevronLeft, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ContactModal } from "@/components/layout/contact-modal"

const popularSearches = [
  { city: "الرياض", cityEn: "Riyadh", country: "السعودية", countryEn: "KSA" },
  { city: "جدة", cityEn: "Jeddah", country: "السعودية", countryEn: "KSA" },
  { city: "دبي", cityEn: "Dubai", country: "الإمارات", countryEn: "UAE" },
  { city: "الدوحة", cityEn: "Doha", country: "قطر", countryEn: "Qatar" },
  { city: "مسقط", cityEn: "Muscat", country: "عمان", countryEn: "Oman" },
  { city: "الكويت", cityEn: "Kuwait", country: "الكويت", countryEn: "Kuwait" },
]

const trendingCars = [
  { id: "1", title: "تويوتا كامري 2024", titleEn: "Toyota Camry 2024", price: 250, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400", brand: "Toyota", seats: 5, transmission: "أوتوماتيك", badge: "best-deal" },
  { id: "2", title: "مرسيدس بنز E-Class", titleEn: "Mercedes E-Class", price: 650, image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400", brand: "Mercedes", seats: 5, transmission: "أوتوماتيك", badge: "premium" },
  { id: "3", title: "نيسان باترول 2024", titleEn: "Nissan Patrol 2024", price: 800, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400", brand: "Nissan", seats: 7, transmission: "أوتوماتيك", badge: "popular" },
  { id: "4", title: "بي إم دبليو X5", titleEn: "BMW X5", price: 750, image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=400", brand: "BMW", seats: 5, transmission: "أوتوماتيك", badge: "luxury" },
]

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 } as any,
}

export default function HomePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showContact, setShowContact] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    router.push(`/cars?${params.toString()}`)
  }

  return (
    <div>
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920')] bg-cover bg-center opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/30" />
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              {locale === "ar" ? "أفضل منصة لتأجير السيارات في الخليج" : "Best car rental platform in the Gulf"}
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {t("home.hero_title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-yellow-400">
                {t("home.hero_subtitle")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("home.hero_desc")}
            </p>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-2xl shadow-black/20"
              >
                <div className="flex-1 flex items-center gap-2 px-4">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("home.search_placeholder")}
                    className="w-full py-2.5 bg-transparent text-primary placeholder:text-muted-foreground focus:outline-none text-sm"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0 rounded-xl shadow-lg shadow-secondary/25">
                  {t("home.search_btn")}
                </Button>
              </motion.div>
            </form>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <p className="text-center text-white/40 text-sm mb-3">
                {locale === "ar" ? "عمليات بحث شائعة" : "Popular searches"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((item) => (
                  <Link
                    key={item.city}
                    href={`/cars?city=${locale === "ar" ? item.city : item.cityEn}`}
                    className="px-4 py-2 text-xs bg-white/5 text-white/60 hover:bg-white/15 hover:text-white rounded-2xl border border-white/5 hover:border-white/20 transition-all"
                  >
                    {locale === "ar" ? item.city : item.cityEn}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div {...fadeUp} className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-accent" />
              {t("home.trending")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {locale === "ar" ? "السيارات الأكثر طلباً" : "Most requested cars"}
            </p>
          </div>
          <Link href="/cars" className="group inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-blue-700 transition-colors">
            {t("home.view_all")}
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        <motion.div {...staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trendingCars.map((car, i) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -6 }}
            >
              <Link href={`/cars/${car.id}`}>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={car.image}
                      alt={locale === "ar" ? car.title : car.titleEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                        {locale === "ar" ? "متاح" : "Available"}
                      </span>
                    </div>
                    {car.badge === "best-deal" && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                          <Star className="w-3 h-3" />
                          {locale === "ar" ? "أفضل عرض" : "Best Deal"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary text-sm leading-snug">
                      {locale === "ar" ? car.title : car.titleEn}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-lg">{car.seats} {locale === "ar" ? "مقاعد" : "seats"}</span>
                      <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-lg">{car.transmission === "أوتوماتيك" ? "Automatic" : "Manual"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-xl font-bold text-secondary">{car.price}</span>
                        <span className="text-[10px] text-muted-foreground mr-1">{locale === "ar" ? "ريال/يوم" : "SAR/day"}</span>
                      </div>
                      <Button size="sm" className="rounded-xl shadow-lg shadow-secondary/20">
                        {locale === "ar" ? "احجز الآن" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-gradient-to-b from-muted to-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">{t("home.how_it_works")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {locale === "ar" ? "ثلاث خطوات بسيطة لاستئجار سيارتك" : "Three simple steps to rent your car"}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "step_1", desc: "step_1_desc", iconColor: "text-secondary", bgColor: "bg-secondary/10" },
              { icon: Calendar, title: "step_2", desc: "step_2_desc", iconColor: "text-accent", bgColor: "bg-accent/10" },
              { icon: Car, title: "step_3", desc: "step_3_desc", iconColor: "text-success", bgColor: "bg-success/10" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mx-auto mb-5`}>
                  <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-primary">{t(`home.${step.title}`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`home.${step.desc}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
            {locale === "ar" ? "لماذا أجرني؟" : "Why Ajrni?"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {locale === "ar" ? "نقدم لك أفضل تجربة لتأجير السيارات" : "We offer you the best car rental experience"}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: locale === "ar" ? "مكاتب موثقة" : "Verified Offices", desc: locale === "ar" ? "جميع المكاتب موثقة ومرخصة لضمان أفضل خدمة" : "All offices are verified and licensed for the best service", gradient: "from-blue-500 to-blue-600", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
            { icon: Zap, title: locale === "ar" ? "استجابة سريعة" : "Fast Response", desc: locale === "ar" ? "تواصل مباشر مع المكاتب عبر واتساب" : "Direct communication with offices via WhatsApp", gradient: "from-amber-500 to-amber-600", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
            { icon: Star, title: locale === "ar" ? "بدون دفعة مسبقة" : "No Upfront Payment", desc: locale === "ar" ? "ادفع عند استلام السيارة، لا توجد رسوم خفية" : "Pay when you receive the car, no hidden fees", gradient: "from-emerald-500 to-emerald-600", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl p-8 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-7 h-7 ${item.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-secondary to-blue-700 py-16">
        <motion.div {...fadeUp} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {locale === "ar" ? "هل أنت مكتب تأجير سيارات؟" : "Are you a car rental office?"}
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            {locale === "ar"
              ? "انضم إلى أجرني واعرض سياراتك لآلاف العملاء في الخليج"
              : "Join Ajrni and showcase your cars to thousands of customers in the Gulf"}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="rounded-xl shadow-xl text-base">
                {locale === "ar" ? "انضم الآن" : "Join Now"}
              </Button>
            </Link>
            <button
              onClick={() => setShowContact(true)}
              className="px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all"
            >
              {locale === "ar" ? "تواصل معنا" : "Contact Us"}
            </button>
          </div>
        </motion.div>
      </section>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </div>
  )
}
