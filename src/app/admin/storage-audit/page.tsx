"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import Link from "next/link"
import { Shield, HardDrive, AlertTriangle, CheckCircle, Loader2, ImageIcon, Database, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocaleStore } from "@/store/useLocaleStore"
import { getClient } from "@/lib/supabase/client"

type FileItem = {
  bucket: string
  name: string
  sizeBytes: number
  sizeFormatted: string
  publicUrl: string
  needsOptimization: boolean
}

type BucketSummary = {
  bucket: string
  totalFiles: number
  totalSizeBytes: number
  largeFiles: number
  largeSizeBytes: number
}

const BUCKETS = ["cars", "Offices", "Banners"]
const MAX_SIZE = 500 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function listAllFiles(supabase: ReturnType<typeof getClient>, bucket: string): Promise<FileItem[]> {
  const items: FileItem[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list("", { limit, offset, sortBy: { column: "name", order: "asc" } })
    if (error) {
      console.error(`Error listing ${bucket}:`, error)
      break
    }
    if (!data || data.length === 0) break

    for (const file of data) {
      const size = file.metadata?.size ?? 0
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name)
      items.push({
        bucket,
        name: file.name,
        sizeBytes: size,
        sizeFormatted: formatSize(size),
        publicUrl: urlData.publicUrl,
        needsOptimization: size > MAX_SIZE,
      })
    }
    if (data.length < limit) break
    offset += limit
  }

  return items
}

export default function StorageAuditPage() {
  const { locale } = useLocaleStore()
  const { isAuthenticated, profile, loading } = useAuthStore()
  const [files, setFiles] = useState<FileItem[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState("")

  const supabase = getClient()

  const startScan = useCallback(async () => {
    setScanning(true)
    setError("")
    const all: FileItem[] = []
    try {
      for (const bucket of BUCKETS) {
        const bucketFiles = await listAllFiles(supabase, bucket)
        all.push(...bucketFiles)
      }
      setFiles(all)
      setScanned(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed")
    } finally {
      setScanning(false)
    }
  }, [supabase])

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
  }

  if (!isAuthenticated || profile?.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{locale === "ar" ? "غير مصرح" : "Unauthorized"}</h2>
        <Link href="/auth/login"><Button>{locale === "ar" ? "تسجيل الدخول" : "Login"}</Button></Link>
      </div>
    )
  }

  const summaries: BucketSummary[] = BUCKETS.map((bucket) => {
    const bucketFiles = files.filter((f) => f.bucket === bucket)
    const largeFiles = bucketFiles.filter((f) => f.needsOptimization)
    return {
      bucket,
      totalFiles: bucketFiles.length,
      totalSizeBytes: bucketFiles.reduce((sum, f) => sum + f.sizeBytes, 0),
      largeFiles: largeFiles.length,
      largeSizeBytes: largeFiles.reduce((sum, f) => sum + f.sizeBytes, 0),
    }
  })

  const totalLargeFiles = summaries.reduce((s, b) => s + b.largeFiles, 0)
  const totalLargeBytes = summaries.reduce((s, b) => s + b.largeSizeBytes, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <HardDrive className="w-6 h-6" />
            {locale === "ar" ? "فحص التخزين" : "Storage Audit"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "ar"
              ? "أداة آمنة لفحص أحجام الصور في التخزين — لا يتم حذف أو تعديل أي ملف"
              : "Safe read-only scan of image sizes in Storage — no files are deleted or modified"}
          </p>
        </div>
        <Button onClick={startScan} disabled={scanning}>
          {scanning ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />{locale === "ar" ? "جاري الفحص..." : "Scanning..."}</> : <>{locale === "ar" ? "بدء الفحص" : "Start Scan"}</>}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">{error}</div>
      )}

      {scanning && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <Loader2 className="w-10 h-10 text-secondary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{locale === "ar" ? "جارٍ فحص جميع المجلدات..." : "Scanning all buckets..."}</p>
        </div>
      )}

      {scanned && !scanning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {summaries.map((s) => (
              <div key={s.bucket} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-primary">{s.bucket}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar" ? "إجمالي الملفات:" : "Total files:"} <strong>{s.totalFiles}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar" ? "الحجم الإجمالي:" : "Total size:"} <strong>{formatSize(s.totalSizeBytes)}</strong>
                </p>
                {s.largeFiles > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {s.largeFiles} {locale === "ar" ? "ملف كبير" : "large files"} — {formatSize(s.largeSizeBytes)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalLargeFiles > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-semibold">
                  {locale === "ar" ? "ملخص الصور الكبيرة" : "Large Images Summary"}
                </p>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                {locale === "ar"
                  ? `تم العثور على ${totalLargeFiles} صورة بحجم أكبر من 500KB (إجمالي ${formatSize(totalLargeBytes)}).`
                  : `Found ${totalLargeFiles} images larger than 500KB (total ${formatSize(totalLargeBytes)}).`}
                <br />
                {locale === "ar"
                  ? `بعد الضغط إلى WebP بحجم ~150-500KB لكل صورة، يمكن توفير ما يقارب ${formatSize(totalLargeBytes - totalLargeFiles * 300 * 1024)}.`
                  : `After compressing to ~150-500KB WebP per image, estimated savings: ${formatSize(totalLargeBytes - totalLargeFiles * 300 * 1024)}.`}
              </p>
            </div>
          )}

          {totalLargeFiles === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <p className="font-semibold">{locale === "ar" ? "جميع الصور ضمن الحد المسموح" : "All images are within the size limit"}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">{locale === "ar" ? "المجلد" : "Bucket"}</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">{locale === "ar" ? "اسم الملف" : "File Name"}</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">{locale === "ar" ? "الحجم" : "Size"}</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">{locale === "ar" ? "الحالة" : "Status"}</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">{locale === "ar" ? "الرابط" : "URL"}</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={`${file.bucket}-${file.name}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Badge variant="default">{file.bucket}</Badge>
                      </td>
                      <td className="px-4 py-2 text-primary font-mono text-xs max-w-[200px] truncate" title={file.name}>
                        <FileImage className="w-3 h-3 inline ml-1 text-muted-foreground" />
                        {file.name}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{file.sizeFormatted}</td>
                      <td className="px-4 py-2 text-center">
                        {file.needsOptimization ? (
                          <Badge variant="error">{locale === "ar" ? "يحتاج ضغط" : "Needs Opt."}</Badge>
                        ) : (
                          <Badge variant="success">{locale === "ar" ? "مقبول" : "OK"}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 max-w-[250px] truncate">
                        <a href={file.publicUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline text-xs" title={file.publicUrl}>
                          {file.publicUrl}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!scanned && !scanning && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {locale === "ar"
              ? `اضغط على "بدء الفحص" لتحليل الصور الموجودة في التخزين.`
              : 'Click "Start Scan" to analyze existing images in Storage.'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {locale === "ar"
              ? "سيتم فحص المجلدات: cars, Offices, Banners"
              : "Buckets to scan: cars, Offices, Banners"}
          </p>
        </div>
      )}
    </div>
  )
}
