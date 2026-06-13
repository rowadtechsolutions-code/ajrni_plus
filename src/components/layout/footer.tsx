"use client"

import Link from "next/link"
import { Phone, Mail, ArrowUp } from "lucide-react"
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

const WHATSAPP_NUMBER = "96876972871"

const socialLinks = [
  { icon: FaWhatsapp, href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp", hoverClass: "hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10" },
  { icon: FaInstagram, href: "https://www.instagram.com/ajrni", label: "Instagram", hoverClass: "hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10" },
  { icon: FaFacebookF, href: "https://www.facebook.com/ajrni", label: "Facebook", hoverClass: "hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10" },
  { icon: FaXTwitter, href: "https://x.com/ajrni", label: "X (Twitter)", hoverClass: "hover:text-white hover:border-white/30 hover:bg-white/10" },
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
              <img src="/images/logo.png" alt="Ajrni" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-xl font-bold tracking-tight">أجرني</span>
                <span className="text-sm text-white/40 font-medium mr-1.5">| Ajrni</span>
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              {locale === "ar"
                ? "أجرني منصة ذكية تربط العملاء بمكاتب تأجير السيارات في الخليج، لتجربة حجز سهلة وسريعة وموثوقة."
                : "Ajrni is a smart platform connecting customers with car rental offices in the Gulf, for an easy, fast, and reliable booking experience."}
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
                href={`tel:+96876972871`}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <span dir="ltr">+968 76972871</span>
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
                href="mailto:info@ajrni.com"
                className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@ajrni.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Ajrni | أجرني. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-all">
              {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-all">
              {locale === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
