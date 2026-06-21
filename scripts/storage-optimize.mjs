import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, "..", ".env")

function loadEnv() {
  const raw = fs.readFileSync(envPath, "utf-8")
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKETS = ["cars", "Offices", "Banners"]
const MAX_SIZE = 500 * 1024
const TARGET_QUALITY = 80

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function listAllFiles(bucket, prefix = "") {
  const all = []
  let offset = 0
  const limit = 100
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    })
    if (error) {
      console.error(`  [ERROR] listing ${bucket}/${prefix} at offset ${offset}:`, error.message)
      break
    }
    if (!data || data.length === 0) break
    for (const f of data) {
      const isFolder = !f.id
      if (isFolder) {
        const nested = await listAllFiles(bucket, prefix ? `${prefix}/${f.name}` : f.name)
        all.push(...nested)
      } else {
        let size = f.metadata?.size ?? f.metadata?.contentLength ?? 0
        if (size === 0) {
          try {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(prefix ? `${prefix}/${f.name}` : f.name)
            const headResp = await fetch(urlData.publicUrl, { method: "HEAD" })
            size = parseInt(headResp.headers.get("content-length") || "0", 10)
          } catch {}
        }
        const filePath = prefix ? `${prefix}/${f.name}` : f.name
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
        all.push({
          bucket,
          name: filePath,
          sizeBytes: size,
          sizeFormatted: fmt(size),
          publicUrl: urlData.publicUrl,
          large: size > MAX_SIZE,
        })
      }
    }
    if (data.length < limit) break
    offset += limit
  }
  return all
}

async function auditMode() {
  console.log("\n=== Storage Audit (Read-Only) ===\n")
  let total = 0
  let totalLarge = 0
  let totalLargeBytes = 0

  for (const bucket of BUCKETS) {
    const files = await listAllFiles(bucket)
    const large = files.filter((f) => f.large)
    const bucketSize = files.reduce((s, f) => s + f.sizeBytes, 0)
    const largeSize = large.reduce((s, f) => s + f.sizeBytes, 0)
    total += files.length
    totalLarge += large.length
    totalLargeBytes += largeSize

    console.log(`\n── ${bucket} ──`)
    console.log(`  Total files: ${files.length}  |  Total size: ${fmt(bucketSize)}`)
    if (large.length === 0) {
      console.log("  ✓ All images within limit (≤ 500 KB)")
    } else {
      console.log(`  ✗ ${large.length} large file(s) — ${fmt(largeSize)}`)
      for (const f of large) {
        console.log(`    • ${f.name}  (${f.sizeFormatted})`)
      }
    }
  }

  console.log(`\n─── Summary ───`)
  console.log(`  Total files scanned: ${total}`)
  console.log(`  Large files (>500KB): ${totalLarge}`)
  console.log(`  Total large size: ${fmt(totalLargeBytes)}`)
  if (totalLarge > 0) {
    const estimated = totalLargeBytes - totalLarge * 300 * 1024
    console.log(`  Estimated savings after compression: ${fmt(Math.max(0, estimated))}`)
  }
  console.log("")
}

async function downloadFile(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function compressBuffer(buf) {
  let quality = TARGET_QUALITY
  let result
  while (quality >= 30) {
    result = await sharp(buf).webp({ quality }).toBuffer()
    if (result.length <= MAX_SIZE) return { buffer: result, quality, size: result.length }
    quality -= 10
  }
  return { buffer: result, quality, size: result.length }
}

async function optimizeMode() {
  console.log("\n=== Storage Optimize Mode ===\n")
  console.log("WARNING: This will compress and replace large images in the following buckets:")
  BUCKETS.forEach((b) => console.log(`  - ${b}`))
  console.log("")

  let totalProcessed = 0
  let totalFailed = 0
  let totalBytesBefore = 0
  let totalBytesAfter = 0

  for (const bucket of BUCKETS) {
    const files = await listAllFiles(bucket)
    const large = files.filter((f) => f.large)

    if (large.length === 0) {
      console.log(`  ${bucket}: No large files to process`)
      continue
    }

    console.log(`\n  Processing ${bucket} (${large.length} large file(s)):`)

    for (const file of large) {
      const dir = path.dirname(file.name)
      const originalExt = path.extname(file.name).toLowerCase()
      const baseName = path.basename(file.name, originalExt)
      const newName = dir === "." ? `${baseName}.webp` : `${dir}/${baseName}.webp`

      console.log(`    → ${file.name} (${file.sizeFormatted})`)

      try {
        const buf = await downloadFile(file.publicUrl)
        const { buffer: compressed, quality } = await compressBuffer(buf)

        if (compressed.length >= file.sizeBytes) {
          console.log(`      SKIP (compressed not smaller: ${fmt(compressed.length)})`)
          totalFailed++
          continue
        }

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(newName, compressed, {
            upsert: true,
            contentType: "image/webp",
            cacheControl: "31536000",
          })

        if (uploadError) {
          console.log(`      FAIL upload: ${uploadError.message}`)
          totalFailed++
          continue
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(newName)
        const newUrl = urlData.publicUrl

        const dbUpdateSuccess = await updateDatabaseReferences(bucket, file.publicUrl, newUrl)

        if (!dbUpdateSuccess) {
          console.log(`      FAIL DB update — reverting, old file kept`)
          await supabase.storage.from(bucket).remove([newName]).catch(() => {})
          totalFailed++
          continue
        }

        const { error: deleteError } = await supabase.storage.from(bucket).remove([file.name])
        if (deleteError) {
          console.log(`      WARN old file not deleted: ${deleteError.message} (DB already updated)`)
        }

        totalProcessed++
        totalBytesBefore += file.sizeBytes
        totalBytesAfter += compressed.length
        console.log(`      ✓ Compressed (q${quality}) ${fmt(file.sizeBytes)} → ${fmt(compressed.length)} (saved ${fmt(file.sizeBytes - compressed.length)})`)
      } catch (e) {
        console.log(`      FAIL: ${e.message}`)
        totalFailed++
      }
    }
  }

  console.log(`\n─── Final Report ───`)
  console.log(`  Successfully compressed: ${totalProcessed}`)
  console.log(`  Failed: ${totalFailed}`)
  console.log(`  Total space saved: ${fmt(totalBytesBefore - totalBytesAfter)}`)
  console.log(`  (${fmt(totalBytesBefore)} → ${fmt(totalBytesAfter)})`)
  console.log("")
}

async function updateDatabaseReferences(bucket, oldUrl, newUrl) {
  try {
    if (bucket === "cars") {
      const { data: carsWithImage, error: imgErr } = await supabase
        .from("cars")
        .select("id, image, images")
        .eq("image", oldUrl)

      if (imgErr) {
        console.log(`      DB query error (image): ${imgErr.message}`)
        return false
      }

      for (const car of carsWithImage || []) {
        const { error: upErr } = await supabase
          .from("cars")
          .update({ image: newUrl })
          .eq("id", car.id)
        if (upErr) {
          console.log(`      DB update error for car ${car.id}: ${upErr.message}`)
          return false
        }
      }

      const { data: carsWithImages, error: arrErr } = await supabase
        .from("cars")
        .select("id, images")
        .contains("images", [oldUrl])

      if (arrErr) {
        console.log(`      DB query error (images array): ${arrErr.message}`)
        return false
      }

      for (const car of carsWithImages || []) {
        const updated = (car.images || []).map((u) => (u === oldUrl ? newUrl : u))
        const { error: upErr } = await supabase
          .from("cars")
          .update({ images: updated })
          .eq("id", car.id)
        if (upErr) {
          console.log(`      DB update error for car ${car.id} images: ${upErr.message}`)
          return false
        }
      }
    }

    if (bucket === "Offices") {
      for (const col of ["image", "cover"]) {
        const { data: rows, error: qErr } = await supabase
          .from("Offices")
          .select("id")
          .eq(col, oldUrl)

        if (qErr) {
          console.log(`      DB query error (Offices.${col}): ${qErr.message}`)
          return false
        }

        for (const row of rows || []) {
          const { error: upErr } = await supabase
            .from("Offices")
            .update({ [col]: newUrl })
            .eq("id", row.id)
          if (upErr) {
            console.log(`      DB update error for office ${row.id}.${col}: ${upErr.message}`)
            return false
          }
        }
      }
    }

    return true
  } catch (e) {
    console.log(`      DB update exception: ${e.message}`)
    return false
  }
}

const mode = process.argv[2] || "audit"

if (mode === "--audit" || mode === "audit") {
  await auditMode()
} else if (mode === "--optimize" || mode === "optimize") {
  await optimizeMode()
} else {
  console.log("Usage: node scripts/storage-optimize.mjs [--audit | --optimize]")
  console.log("  --audit     (default) Read-only report of large images")
  console.log("  --optimize  Compress large images and update DB references")
  process.exit(1)
}
