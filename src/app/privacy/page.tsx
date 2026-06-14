"use client"

import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"

export default function PrivacyPage() {
  const { locale } = useLocaleStore()

  const content = locale === "ar" ? {
    title: "سياسة الخصوصية",
    sections: [
      {
        title: "مقدمة",
        text: "نحن في أجرني بلس نلتزم بحماية خصوصية مستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصتنا.",
      },
      {
        title: "المعلومات التي نجمعها",
        text: "نجمع المعلومات التالية: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، الدولة، المدينة، ومعلومات السيارة التي يتم إضافتها بواسطة مكاتب التأجير.",
      },
      {
        title: "كيف نستخدم معلوماتك",
        text: "نستخدم معلوماتك لتقديم خدمات حجز السيارات، تحسين تجربتك على المنصة، التواصل معك بخصوص حجوزاتك، وإرسال التحديثات المتعلقة بالخدمة.",
      },
      {
        title: "حماية المعلومات",
        text: "نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف.",
      },
      {
        title: "مشاركة المعلومات",
        text: "نحن لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا بقدر ما هو ضروري لتقديم الخدمة (مثل مشاركة معلومات الحجز مع مكتب التأجير المعني).",
      },
      {
        title: "ملفات تعريف الارتباط (Cookies)",
        text: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.",
      },
      {
        title: "التعديلات على السياسة",
        text: "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عن طريق البريد الإلكتروني أو إشعار على المنصة.",
      },
      {
        title: "اتصل بنا",
        text: "إذا كانت لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: ajrniplus@gmail.com",
      },
    ],
  } : {
    title: "Privacy Policy",
    sections: [
      {
        title: "Introduction",
        text: "At Ajrni Plus, we are committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, and protect the personal information you provide when using our platform.",
      },
      {
        title: "Information We Collect",
        text: "We collect the following information: full name, email address, phone number, country, city, and car information added by rental offices.",
      },
      {
        title: "How We Use Your Information",
        text: "We use your information to provide car booking services, improve your experience on the platform, communicate with you regarding your bookings, and send service-related updates.",
      },
      {
        title: "Information Protection",
        text: "We take appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.",
      },
      {
        title: "Information Sharing",
        text: "We do not share your personal information with third parties except as necessary to provide the service (such as sharing booking information with the relevant rental office).",
      },
      {
        title: "Cookies",
        text: "We use cookies to improve your experience on the platform. You can control cookie settings through your browser.",
      },
      {
        title: "Changes to This Policy",
        text: "We may update this Privacy Policy from time to time. We will notify you of any material changes by email or notice on the platform.",
      },
      {
        title: "Contact Us",
        text: "If you have any questions about this Privacy Policy, please contact us at: ajrniplus@gmail.com",
      },
    ],
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" />
        {locale === "ar" ? "العودة للرئيسية" : "Back to home"}
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-secondary" />
        <h1 className="text-2xl md:text-3xl font-bold text-primary">{content.title}</h1>
      </div>
      <div className="space-y-8">
        {content.sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold text-primary mb-2">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
