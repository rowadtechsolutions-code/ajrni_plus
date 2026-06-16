"use client"

import Link from "next/link"
import { Phone, Mail, ArrowUp } from "lucide-react"
import { FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa6"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

const WHATSAPP_NUMBER = "96876791559"

const socialLinks = [
  { icon: FaWhatsapp, href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp", hoverClass: "hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10" },
  { icon: FaInstagram, href: "https://www.instagram.com/ajrniplus/", label: "Instagram", hoverClass: "hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@ajrni.plus?lang=en", label: "TikTok", hoverClass: "hover:text-white hover:border-white/30 hover:bg-white/10" },
]

const quickLinks = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/cars", labelKey: "nav.cars" },
  { href: "/offices", labelKey: "nav.offices" },
  { href: "/contact", labelKey: "nav.contact" },
]

export function Footer() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/images/logo_fotar.png"
                alt="أجرني بلس"
                className="h-14 w-auto max-w-[280px] sm:max-w-[350px] md:max-w-[400px] object-contain"
              />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              {locale === "ar"
                ? "أجرني بلس منصة ذكية تربط العملاء بمكاتب تأجير السيارات في الخليج، لتجربة حجز سهلة وسريعة وموثوقة."
                : "Ajrni Plus is a smart platform connecting customers with car rental offices in the Gulf, for an easy, fast, and reliable booking experience."}
            </p>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 transition-all duration-300 hover:scale-110 ${social.hoverClass}`}
                >
                  <social.icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 tracking-wide">
              {locale === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-all duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 tracking-wide">
              {locale === "ar" ? "تواصل معنا" : "Contact Us"}
            </h4>
            <div className="space-y-3">
              <a
                href={`tel:+96876791559`}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <span dir="ltr">+968 76791559</span>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/50 hover:text-green-400 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                  <FaWhatsapp className="w-4 h-4 text-green-400" />
                </div>
                <span>{locale === "ar" ? "واتساب" : "WhatsApp"}</span>
              </a>
              <a
                href="mailto:ajrniplus@gmail.com"
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <span>ajrniplus@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 pb-24 sm:pb-8">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30 text-center sm:text-left">
              © {new Date().getFullYear()} Ajrni Plus | أجرني بلس. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-all">
                {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
              <span className="text-white/10">|</span>
              <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-all">
                {locale === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
              </Link>
            </div>
          </div>
          <p className="text-xs text-white/20 text-center mt-4">
            {locale === "ar"
              ? "أجرني بلس منصة تقنية مملوكة ومدارة بواسطة رواد للحلول التقنية"
              : "Ajrni Plus platform was created and is managed by Rowad Information Technology."}
          </p>
        </div>
      </div>
    </footer>
  )
}
