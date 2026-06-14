"use client"

import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"

export default function TermsPage() {
  const { locale } = useLocaleStore()

  const content = locale === "ar" ? {
    title: "الشروط والأحكام",
    sections: [
      {
        title: "القبول بالشروط",
        text: "باستخدامك لمنصة أجرني بلس، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة.",
      },
      {
        title: "الخدمات المقدمة",
        text: "أجرني بلس هي منصة وسيطة تربط بين مستأجري السيارات ومكاتب التأجير. نحن لا نملك السيارات المعروضة ولا نقدم خدمات التأجير بشكل مباشر.",
      },
      {
        title: "الحسابات والتسجيل",
        text: "يجب عليك إنشاء حساب لاستخدام بعض خدمات المنصة. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور، وعن جميع الأنشطة التي تحدث تحت حسابك.",
      },
      {
        title: "مكاتب التأجير",
        text: "مكاتب التأجير هي المسؤولة عن دقة معلومات السيارات المعروضة، وتوفرها، وأسعارها، وشروط التأجير. أجرني بلس غير مسؤولة عن أي نزاعات تنشأ بين المستأجر ومكتب التأجير.",
      },
      {
        title: "الحجوزات والدفع",
        text: "يتم الحجز مباشرة مع مكتب التأجير. أجرني بلس لا تتلقى أي مدفوعات نيابة عن مكاتب التأجير. جميع المدفوعات تتم بين المستأجر ومكتب التأجير مباشرة.",
      },
      {
        title: "سلوك المستخدم",
        text: "توافق على استخدام المنصة فقط للأغراض القانونية. يمنع استخدام المنصة لأي نشاط غير قانوني أو احتيالي أو يضر بالآخرين.",
      },
      {
        title: "إخلاء المسؤولية",
        text: "أجرني بلس غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو عدم القدرة على استخدامها.",
      },
      {
        title: "التعديلات على الشروط",
        text: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على المنصة.",
      },
      {
        title: "القانون الواجب التطبيق",
        text: "تخضع هذه الشروط وأي نزاعات ناشئة عنها للقوانين المعمول بها في سلطنة عمان.",
      },
      {
        title: "اتصل بنا",
        text: "للاستفسارات المتعلقة بهذه الشروط، يرجى التواصل عبر: ajrniplus@gmail.com",
      },
    ],
  } : {
    title: "Terms & Conditions",
    sections: [
      {
        title: "Acceptance of Terms",
        text: "By using Ajrni Plus platform, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, you should not use the platform.",
      },
      {
        title: "Services Provided",
        text: "Ajrni Plus is an intermediary platform connecting car renters with rental offices. We do not own the listed cars nor provide rental services directly.",
      },
      {
        title: "Accounts and Registration",
        text: "You must create an account to use some of our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
      },
      {
        title: "Rental Offices",
        text: "Rental offices are responsible for the accuracy of car information, availability, prices, and rental terms. Ajrni Plus is not responsible for any disputes between renters and rental offices.",
      },
      {
        title: "Bookings and Payment",
        text: "Bookings are made directly with the rental office. Ajrni Plus does not process any payments on behalf of rental offices. All payments are made directly between the renter and the rental office.",
      },
      {
        title: "User Conduct",
        text: "You agree to use the platform only for lawful purposes. You may not use the platform for any illegal, fraudulent, or harmful activity.",
      },
      {
        title: "Disclaimer",
        text: "Ajrni Plus is not liable for any direct or indirect damages arising from the use or inability to use the platform.",
      },
      {
        title: "Changes to Terms",
        text: "We reserve the right to modify these terms at any time. Users will be notified of material changes via email or notice on the platform.",
      },
      {
        title: "Governing Law",
        text: "These terms and any disputes arising from them shall be governed by the laws of the Sultanate of Oman.",
      },
      {
        title: "Contact Us",
        text: "For inquiries regarding these terms, please contact us at: ajrniplus@gmail.com",
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
        <FileText className="w-8 h-8 text-secondary" />
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
