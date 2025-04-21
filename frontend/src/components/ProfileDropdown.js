/**
 * 
 * User profile dropdown menu component
 * Shows user info and provides account-related options
 * Handles sign out functionality
 * 
 * @dependencies
 *  - useState, useRef, useEffect hooks
 *  - framer-motion for animations
 *  - next/navigation for routing
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useUserProfile } from "../hooks/useUserProfile.js"

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { name, email, initials, loading } = useUserProfile()
  const dropdownRef = useRef(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = () => {
    setIsOpen(false)

    // Here we would clear any auth tokens/cookies
    localStorage.removeItem("authToken");
    
    // Redirect to home page
    router.push("/")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300"
        aria-label="Open profile menu"
      >
        {initials}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-md border border-white/10 rounded-md shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-white font-mono text-sm font-medium">{name}</p>
              <p className="text-gray-400 font-mono text-xs truncate">{email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-150 font-mono"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}