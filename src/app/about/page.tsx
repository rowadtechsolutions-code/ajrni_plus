"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Search, MessageCircle, Car, Zap, Building2, MapPin, Users, Star, Headphones } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
}

export default function AboutPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)

  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920')] bg-cover bg-center opacity-[0.06]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm mb-6">
              <Building2 className="w-4 h-4 text-accent" />
              {locale === "ar" ? "منصة الخليج الأولى لتأجير السيارات" : "The Gulf's Leading Car Rental Platform"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {t("about.title")}
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {locale === "ar"
                ? "منصة رقمية تربط المستأجرين بأفضل مكاتب تأجير السيارات الموثوقة في دول الخليج، لتجربة تأجير سلسة وآمنة."
                : "A digital marketplace connecting renters with trusted car rental offices across the Gulf for a seamless and secure rental experience."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4">
              <Shield className="w-3 h-3" />
              {locale === "ar" ? "رسالتنا" : "Our Mission"}
            </div>
            <h2 className="text-3xl font-bold text-primary mb-4">
              {t("about.mission_title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.mission_desc")}
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-secondary/20 to-blue-600/10 border border-gray-100 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary/25">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-primary">{t("about.vision_title")}</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{t("about.vision_desc")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4">
              <Search className="w-3 h-3" />
              {locale === "ar" ? "خطوات بسيطة" : "Simple Steps"}
            </div>
            <h2 className="text-3xl font-bold text-primary mb-3">{t("home.how_it_works")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {locale === "ar"
                ? "ثلاث خطوات بسيطة لاستئجار سيارتك المثالية"
                : "Three simple steps to rent your perfect car"}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: "step_1", desc: "step_1_desc", bgColor: "bg-blue-50", iconColor: "text-blue-600", number: "01" },
              { icon: MessageCircle, title: "step_2", desc: "step_2_desc", bgColor: "bg-secondary/5", iconColor: "text-secondary", number: "02" },
              { icon: Car, title: "step_3", desc: "step_3_desc", bgColor: "bg-emerald-50", iconColor: "text-emerald-600", number: "03" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl p-8 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-5xl font-bold text-gray-100 select-none">{step.number}</div>
                <div className={`w-14 h-14 rounded-2xl ${step.bgColor} flex items-center justify-center mb-5 relative`}>
                  <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2 relative">{t(`home.${step.title}`)}</h3>
                <p className="text-sm text-muted-foreground relative">{t(`home.${step.desc}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div {...fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
            <Star className="w-3 h-3" />
            {locale === "ar" ? "لماذا نحن" : "Why Us"}
          </div>
          <h2 className="text-3xl font-bold text-primary mb-3">{t("about.why_title")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {locale === "ar"
              ? "نقدم أفضل تجربة تأجير سيارات في الخليج"
              : "We provide the best car rental experience in the Gulf"}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Shield, title: "why_1", desc: "why_1_desc", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
            { icon: Zap, title: "why_2", desc: "why_2_desc", bgColor: "bg-amber-50", iconColor: "text-amber-600" },
            { icon: Headphones, title: "why_3", desc: "why_3_desc", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
            { icon: MessageCircle, title: "why_4", desc: "why_4_desc", bgColor: "bg-green-50", iconColor: "text-green-600" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl p-6 text-center transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">{t(`about.${item.title}`)}</h3>
              <p className="text-xs text-muted-foreground">{t(`about.${item.desc}`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Building2, value: "50+", label: "stats_offices" },
              { icon: MapPin, value: "25+", label: "stats_cities" },
              { icon: Car, value: "500+", label: "stats_cars" },
              { icon: Users, value: "10K+", label: "stats_clients" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{t(`about.${stat.label}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
