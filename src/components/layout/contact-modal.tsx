"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Phone, MessageCircle } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const WHATSAPP_NUMBER = "96876791559"

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const { locale } = useLocaleStore()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = encodeURIComponent(
      `👋 ${locale === "ar" ? "الاسم" : "Name"}: ${name}\n📞 ${locale === "ar" ? "الهاتف" : "Phone"}: ${phone}\n💬 ${locale === "ar" ? "الرسالة" : "Message"}: ${message}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank")
    setName("")
    setPhone("")
    setMessage("")
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-l from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {locale === "ar" ? "تواصل معنا" : "Contact Us"}
                    </h3>
                    <p className="text-sm text-white/80">
                      {locale === "ar" ? "نحن هنا لمساعدتك" : "We're here to help"}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                id="contact-name"
                label={locale === "ar" ? "الاسم" : "Name"}
                placeholder={locale === "ar" ? "اسمك الكريم" : "Your name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="contact-phone"
                label={locale === "ar" ? "رقم الهاتف" : "Phone Number"}
                type="tel"
                placeholder="+968 XXXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-primary">
                  {locale === "ar" ? "الرسالة" : "Message"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder={locale === "ar" ? "اكتب رسالتك هنا..." : "Type your message here..."}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none transition-all"
                />
              </div>
              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white h-12 rounded-2xl gap-2 text-base">
                <Send className="w-4 h-4" />
                {locale === "ar" ? "إرسال عبر واتساب" : "Send via WhatsApp"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {locale === "ar"
                  ? "سيتم تحويلك إلى واتساب لإكمال المحادثة"
                  : "You'll be redirected to WhatsApp to continue"}
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
