/**
 * 
 * @description User registration page component for the Momentum web application
 * @version 1.0
 * @dependencies 
 *  - react
 *  - framer-motion
 *  - next/link
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ThreeCanvas } from "../components"
import { MOMENTUM_LOGO_PATH } from "../constants/momentum-logo-path"

/**
 * Signup page component for the Momentum application
 * Renders a registration form with validation and submission handling
 * 
 * @returns {JSX.Element} Signup page component
 */
export default function SignupPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  // Set component as loaded after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Validate password match
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }, [password, confirmPassword])

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (!agreeTerms) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Signup attempt with:", { name, email, password, agreeTerms })
      setIsSubmitting(false)
      // Here you would typically redirect on successful signup
    }, 1500)
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <ThreeCanvas />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-radial from-transparent via-transparent to-black/70" />

      {/* Logo - Positioned at the bottom right */}
      <motion.div
        className="absolute bottom-8 right-8 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.8 }}
      >
        <Link href="/" className="flex items-center group">
          <span className="text-white font-mono text-sm tracking-tight mr-2 group-hover:text-cyan-400 transition-colors duration-300">
            Momentum
          </span>
          <div className="w-10 h-10 relative">
            <svg
              viewBox="0 0 1380 1090"
              className="w-full h-full fill-white group-hover:fill-cyan-400 transition-colors duration-300"
            >
              <path d={MOMENTUM_LOGO_PATH} />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-sm rounded-full"></div>
          </div>
        </Link>
      </motion.div>

      {/* Signup Form */}
      <div
        className="relative z-20 w-full max-w-md p-8 mx-auto"
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s, transform 0.8s",
        }}
      >
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
          <h2 className="font-mono text-2xl text-white mb-6 text-center tracking-tight">
            <span
              className="relative text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white"
              style={{ textShadow: "0 0 10px rgba(0, 220, 255, 0.3)" }}
            >
              Create Your Account
            </span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-mono text-gray-400">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-mono text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-mono text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-mono text-gray-400">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 bg-black/50 border ${
                  passwordError ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm`}
                placeholder="••••••••"
              />
              {passwordError && <p className="text-red-500 text-xs font-mono mt-1">{passwordError}</p>}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded bg-black/50"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-mono text-gray-400">
                  I agree to the{" "}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !agreeTerms || !!passwordError}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-md transition-all duration-300 font-mono font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-mono text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}