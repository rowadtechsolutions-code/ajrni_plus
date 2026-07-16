"use client"

import Image from "next/image"
import { cn, countryCurrency } from "@/lib/utils"

const CURRENCY_SYMBOL_ASSETS: Partial<Record<string, string>> = {
  OMR: "/icons/currencies/omr.svg",
  SAR: "/icons/currencies/sar.svg",
}

const SYMBOL_SIZES = {
  compact: { pixels: 16, asset: "size-4", assetFallback: "text-[9px]", textFallback: "text-[1em]" },
  card: { pixels: 18, asset: "size-[18px]", assetFallback: "text-[10px]", textFallback: "text-[1em]" },
  detail: {
    pixels: 26,
    asset: "size-[26px]",
    assetFallback: "text-sm",
    textFallback: "text-sm font-semibold md:text-[clamp(1.5rem,5vw,2rem)] md:font-bold",
  },
} as const

type CurrencySymbolSize = keyof typeof SYMBOL_SIZES

interface CurrencySymbolProps {
  currency: string
  fallback?: string
  size?: CurrencySymbolSize
  className?: string
}

interface CurrencyAmountProps {
  amount: number
  currency: string
  size?: CurrencySymbolSize
  className?: string
}

function getFallback(currency: string, fallback?: string) {
  if (fallback) return fallback

  const normalizedCurrency = currency.trim().toUpperCase()
  const configuredCurrency = Object.values(countryCurrency).find(
    (item) => item.code === normalizedCurrency
  )

  return configuredCurrency?.symbol || currency
}

export function CurrencySymbol({
  currency,
  fallback,
  size = "card",
  className,
}: CurrencySymbolProps) {
  const normalizedCurrency = currency.trim().toUpperCase()
  const fallbackText = getFallback(currency, fallback)
  const asset = CURRENCY_SYMBOL_ASSETS[normalizedCurrency]
  const sizeConfig = SYMBOL_SIZES[size]

  if (!asset) {
    return (
      <span
        className={cn("inline-block shrink-0 whitespace-nowrap leading-none", sizeConfig.textFallback, className)}
        data-currency-code={normalizedCurrency || currency}
      >
        {fallbackText}
      </span>
    )
  }

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", sizeConfig.asset, className)}
      role="img"
      aria-label={fallbackText}
      data-currency-code={normalizedCurrency}
    >
      <span
        className={cn("absolute inset-0 inline-flex items-center justify-center leading-none", sizeConfig.assetFallback)}
        aria-hidden="true"
      >
        {fallbackText}
      </span>
      <Image
        src={asset}
        alt=""
        width={sizeConfig.pixels}
        height={sizeConfig.pixels}
        unoptimized
        className="relative z-[1] size-full object-contain"
        onLoad={(event) => {
          const fallbackElement = event.currentTarget.previousElementSibling as HTMLElement | null
          if (fallbackElement) fallbackElement.style.display = "none"
        }}
        onError={(event) => {
          event.currentTarget.style.display = "none"
        }}
      />
    </span>
  )
}

export function CurrencyAmount({
  amount,
  currency,
  size = "card",
  className,
}: CurrencyAmountProps) {
  const priceParts = new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).formatToParts(amount)
  const currencyText = priceParts.find((part) => part.type === "currency")?.value
  const numberText = priceParts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("")

  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap", className)} dir="rtl">
      <span>{numberText}</span>
      <CurrencySymbol currency={currency} fallback={currencyText} size={size} />
    </span>
  )
}
