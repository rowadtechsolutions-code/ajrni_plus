"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react"
import { Button } from "@heroui/react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

const WHATSAPP_NUMBER = "96876972871"

export default function ContactPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = encodeURIComponent(
      `👋 ${locale === "ar" ? "الاسم" : "Name"}: ${name}\n📞 ${locale === "ar" ? "الهاتف" : "Phone"}: ${phone}\n💬 ${locale === "ar" ? "الرسالة" : "Message"}: ${message}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank")
  }

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5 },
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920')] bg-cover bg-center opacity-[0.06]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm mb-6">
              <MessageCircle className="w-4 h-4 text-green-400" />
              {locale === "ar" ? "نحن هنا لمساعدتك" : "We're here to help"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {t("contact.title")}
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          <motion.div {...fadeUp} className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-primary mb-6">
                {locale === "ar" ? "أرسل لنا رسالة" : "Send us a message"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("contact.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("contact.name_placeholder")}
                    required
                    className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("contact.phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder={t("contact.phone_placeholder")}
                    required
                    className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t("contact.message")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("contact.message_placeholder")}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-gray-400 resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-2xl text-base bg-green-600 text-white hover:bg-green-700">
                  <Send className="w-4 h-4" />
                  {t("contact.submit")}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t("contact.redirect_note")}
                </p>
              </form>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h3 className="text-lg font-bold text-primary mb-6">{t("contact.info_title")}</h3>
              <div className="space-y-5">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-all">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.whatsapp")}</p>
                    <p className="text-sm font-semibold text-primary group-hover:text-green-600 transition-colors" dir="ltr">+968 76972871</p>
                  </div>
                </a>
                <a
                  href={`tel:+96876972871`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.phone_label")}</p>
                    <p className="text-sm font-semibold text-primary group-hover:text-blue-600 transition-colors" dir="ltr">+968 76972871</p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.email")}</p>
                    <p className="text-sm font-semibold text-primary">{t("contact.email_value")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("contact.address")}</p>
                    <p className="text-sm font-semibold text-primary">{t("contact.address_value")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-[#0a0f1a] rounded-3xl p-8 text-white">
              <Clock className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-bold mb-2">
                {locale === "ar" ? "ساعات العمل" : "Working Hours"}
              </h3>
              <div className="space-y-2 text-sm text-white/60">
                <p className="flex justify-between">
                  <span>{locale === "ar" ? "السبت - الخميس" : "Sat - Thu"}</span>
                  <span dir="ltr">9:00 AM - 9:00 PM</span>
                </p>
                <p className="flex justify-between">
                  <span>{locale === "ar" ? "الجمعة" : "Friday"}</span>
                  <span dir="ltr">2:00 PM - 9:00 PM</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
