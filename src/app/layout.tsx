"use client"

import { useState, useEffect } from "react"
import { MessageCircle, ArrowUp } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthProvider } from "@/providers/session-provider"
import { QueryProvider } from "@/providers/query-provider"
import { LocaleProvider } from "@/providers/locale-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ContactModal } from "@/components/layout/contact-modal"
import "./globals.css"

const WHATSAPP_NUMBER = "96876972871"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <QueryProvider>
          <AuthProvider>
            <LocaleProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <motion.main
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  {children}
                </motion.main>
                <Footer />
                <MobileNav />
              </div>

              <ContactModal open={showContact} onClose={() => setShowContact(false)} />

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-20 md:bottom-6 left-4 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-110 active:scale-95 transition-all duration-300 animate-[float_3s_ease-in-out_infinite]"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </a>

              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-36 md:bottom-24 right-4 z-40 w-11 h-11 rounded-2xl bg-white border border-gray-200 text-primary flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </LocaleProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
