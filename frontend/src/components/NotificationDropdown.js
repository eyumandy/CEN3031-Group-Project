/**
 * 
 * Displays notifications in a dropdown menu
 * Shows alerts for habit reminders, achievements, and system messages
 * 
 * @dependencies
 *  - useState, useRef, useEffect hooks
 *  - framer-motion for animations
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  // Fetch habits → build notifications
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
      return
    }

    fetch("http://127.0.0.1:5000/habits", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized")
        return res.json()
      })
      .then(({ habits }) => {
        // any habit not completedToday becomes a notification
        const pending = (habits || []).filter(h => !h.completedToday)
        setNotifications(pending)
      })
      .catch((err) => {
        console.error("Failed to load habits:", err)
        // we could also clear token + force login here
      })
      .finally(() => setLoading(false))
  }, [router])

  // number badge
  const badgeText = loading
    ? "…"
    : `${notifications.length} new`

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative text-gray-300 hover:text-white transition-colors duration-300"
        aria-label="View notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
             className="h-6 w-6"
             fill="none"
             viewBox="0 0 24 24"
             stroke="currentColor">
          <path strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 
                   0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 
                   6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 
                   0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* badge in top-right corner */}
        <span className="absolute top-0 right-0 
                 w-4 h-4 text-[8px] leading-4 
                 flex items-center justify-center 
                 text-white bg-red-500 
                 rounded-full
                 transform translate-x-1/2 -translate-y-1/2">
          {notifications.length}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-md 
                       border border-white/10 rounded-md shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-mono text-sm font-medium">Notifications</h3>
              <span className="text-xs font-mono text-gray-400">{badgeText}</span>
            </div>

            {loading ? (
              <div className="p-4 text-center text-gray-400 font-mono text-sm">
                Loading…
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((h) => (
                  <div
                    key={h.id}
                    className="px-4 py-3 hover:bg-white/10 transition-colors duration-150"
                  >
                    <p className="text-white font-mono font-medium">{h.title}</p>
                    {h.description && (
                      <p className="text-gray-400 text-xs font-mono truncate">
                        {h.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-[10px] font-mono mt-1">
                      Reward: {h.coinReward} coins • Difficulty: {h.difficulty}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 17h5l-1.405-1.405A2.032 
                           2.032 0 0118 14.158V11a6.002 
                           6.002 0 00-4-5.659V5a2 2 0 
                           10-4 0v.341C7.67 6.165 6 
                           8.388 6 11v3.159c0 
                           .538-.214 1.055-.595 
                           1.436L4 17h5m6 0v1a3 
                           3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-400 text-sm font-mono mb-1">
                  No pending habits!
                </p>
                <p className="text-gray-500 text-xs font-mono">
                  Nice job — you’ve completed everything for today.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
