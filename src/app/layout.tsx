import type { Metadata, Viewport } from "next"
import { ClientLayout } from "@/components/layout/client-layout"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "أجرني بلس | Ajrni Plus",
    template: "%s | أجرني بلس",
  },
  description: "أجرني بلس — منصة تأجير السيارات في الخليج. احجز سيارة من مكاتب تأجير موثوقة في السعودية، الإمارات، عمان، قطر، الكويت، البحرين.",
  keywords: ["تأجير سيارات", "استئجار سيارة", "سيارات للإيجار", "Ajrni Plus", "أجرني بلس", "تأجير سيارات الخليج", "سيارة مع سائق", "إيجار سيارة شهري"],
  metadataBase: new URL("https://ajrniplus.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/new_favicon2.png",
    shortcut: "/images/new_favicon2.png",
    apple: "/images/new_favicon2.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "أجرني بلس | Ajrni Plus",
    description: "منصة تأجير السيارات في الخليج — احجز سيارة من مكاتب تأجير موثوقة",
    type: "website",
    siteName: "أجرني بلس",
    locale: "ar_SA",
    images: [
      {
        url: "/images/app/og_image.png",
        width: 1200,
        height: 630,
        alt: "أجرني بلس | Ajrni Plus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أجرني بلس | Ajrni Plus",
    description: "منصة تأجير السيارات في الخليج — احجز سيارة من مكاتب تأجير موثوقة",
    images: ["/images/app/og_image.png"],
  },
  other: {
    "google-site-verification": "8-6VslBVgCbKC0O5bwi90HijXc3XTGWkN1_mTssQpMw",
  },
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
