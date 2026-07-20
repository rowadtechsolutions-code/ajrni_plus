"use client"

import { SlidersHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FilterSidebarProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function FilterSidebar({ open, onClose, title, children }: FilterSidebarProps) {
  return (
    <>
      <aside className="hidden md:block w-64 shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
          <h3 className="font-semibold text-primary mb-5 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-secondary" />
            {title}
          </h3>
          {children}
        </div>
      </aside>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 pb-16 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-secondary" />
                  {title}
                </h3>
                <button onClick={onClose} className="p-2 rounded-2xl hover:bg-muted transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
