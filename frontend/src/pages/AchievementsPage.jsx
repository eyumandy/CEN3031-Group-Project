/**
 * 
 * Achievements page component for Momentum
 * 
 * Displays user's earned achievements, progress, and rewards
 * Allows claiming coins for completed achievements
 * 
 * @dependencies
 *  - next/navigation
 *  - react hooks
 *  - framer-motion
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MOMENTUM_LOGO_PATH } from "../constants/momentum-logo-path"
import NotificationDropdown from "../components/NotificationDropdown"
import ProfileDropdown from "../components/ProfileDropdown"

export default function AchievementsPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [coins, setCoins] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all") // all, earned, unearned
  const [searchQuery, setSearchQuery] = useState("")

  // Check for authentication token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    
    // If no auth token, redirect to login page
    if (!authToken) {
      router.push("/login")
      return
    }
    fetchCoins()
    fetchAchievements().finally(() => setIsLoaded(true))
  }, [router])

  const fetchCoins = async () => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) return
    try {
      const res = await fetch("http://127.0.0.1:5000/inventory", {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error()
      const { coins } = await res.json()
      setCoins(coins)
    } catch {
      console.error("Could not load coins")
    }
  }
  
  const fetchAchievements = async () => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) return
  
    try {
      const res = await fetch("http://127.0.0.1:5000/achievements", {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!res.ok) throw new Error("Could not load achievements")
  
      const { achievements: data } = await res.json()
      setAchievements(data)
    } catch (err) {
      console.error("Error fetching achievements:", err)
    }
  }

  // Handler for claiming achievement rewards
  const handleClaimReward = async (achievementId) => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) return

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/achievements/${achievementId}/claim`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      )
      if (!res.ok) {
        console.error("Claim failed")
        return
      }
      const { achievement, currentCoins } = await res.json()

      // replace that one achievement
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === achievement.id ? achievement : a
        )
      )
      // update coins
      setCoins(currentCoins)
    } catch (err) {
      console.error("Error claiming reward:", err)
    }
  }
  // Filter achievements based on active category, filter, and search query
  const filteredAchievements = achievements.filter((achievement) => {
    const matchesCategory = activeCategory === "all" || achievement.category === activeCategory
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "earned" && achievement.earned) ||
      (activeFilter === "unearned" && !achievement.earned)
    const matchesSearch =
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesFilter && matchesSearch
  })

  // Stats calculation
  const totalAchievements = achievements.length
  const earnedAchievements = achievements.filter((achievement) => achievement.earned).length
  const completionRate = totalAchievements > 0 ? Math.round((earnedAchievements / totalAchievements) * 100) : 0
  
  // Function to get color for achievement rarity
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "text-gray-300"
      case "uncommon":
        return "text-green-400"
      case "rare":
        return "text-blue-400"
      case "epic":
        return "text-purple-400"
      case "legendary":
        return "text-yellow-400"
      default:
        return "text-gray-300"
    }
  }

  // Function to get border color for achievement rarity
  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case "common":
        return "border-gray-500/30"
      case "uncommon":
        return "border-green-500/30"
      case "rare":
        return "border-blue-500/30"
      case "epic":
        return "border-purple-500/30"
      case "legendary":
        return "border-yellow-500/30"
      default:
        return "border-gray-500/30"
    }
  }

  // Function to get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "streaks":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case "habits":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        )
    }
  }

  // Function to format dates
  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString(undefined, {
      year:  "numeric",
      month: "short",
      day:   "numeric",
    })
  }
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-black/30 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <div className="w-8 h-8 relative">
                <svg viewBox="0 0 1380 1090" className="w-full h-full fill-white">
                  <path d={MOMENTUM_LOGO_PATH} />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-sm rounded-full"></div>
              </div>
            </Link>
            <span className="text-white font-mono text-lg tracking-tight">Momentum</span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Coin display */}
            <div className="hidden md:flex items-center bg-black/40 border border-yellow-500/30 rounded-full px-3 py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-mono text-yellow-100 font-medium">{coins}</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-sm font-medium relative text-gray-300 hover:text-white transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium relative text-gray-300 hover:text-white transition-colors duration-300"
              >
                Shop
              </Link>
              <Link
                href="/inventory"
                className="text-sm font-medium relative text-gray-300 hover:text-white transition-colors duration-300"
              >
                Inventory
              </Link>
              <Link href="/achievements" className="text-sm font-medium relative text-cyan-400">
                Achievements
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Mobile coin display */}
              <div className="flex md:hidden items-center bg-black/40 border border-yellow-500/30 rounded-full px-2 py-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-yellow-500 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-mono text-yellow-100 text-xs font-medium">{coins}</span>
              </div>

              <NotificationDropdown />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Achievements Header with Stats */}
        <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-2xl md:text-3xl font-mono font-light mb-6">
            Your
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Achievements
            </span>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-mono text-sm">Total Achievements</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                </svg>
                </div>
                <p className="text-2xl font-mono mt-2">{totalAchievements}</p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-mono text-sm">Earned</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                </div>
                <p className="text-2xl font-mono mt-2">
                {earnedAchievements} / {totalAchievements}
                </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-mono text-sm">Completion Rate</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                </div>
                <p className="text-2xl font-mono mt-2">{completionRate}%</p>
            </div>
            </div>
        </motion.div>
        {/* Filters and Search */}
        <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex flex-wrap gap-2">
            <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeCategory === "all"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
                }`}
            >
                All Categories
            </button>
            <button
                onClick={() => setActiveCategory("streaks")}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeCategory === "streaks"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
                }`}
            >
                Streaks
            </button>
            <button
                onClick={() => setActiveCategory("habits")}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeCategory === "habits"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
                }`}
            >
                Habits
            </button>
            </div>

            <div className="flex w-full md:w-auto space-x-2">
            <div className="flex space-x-2 mr-2">
                <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                    activeFilter === "all"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
                }`}
                >
                All
                </button>
                <button
                onClick={() => setActiveFilter("earned")}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                    activeFilter === "earned"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
                }`}
                >
                Earned
                </button>
                <button
                onClick={() => setActiveFilter("unearned")}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                    activeFilter === "unearned"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
                }`}
                >
                In Progress
                </button>
            </div>

            <div className="relative flex-grow md:w-64">
                <input
                type="text"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                />
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
                </svg>
            </div>
            </div>
        </motion.div>
        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isLoaded ? (
              filteredAchievements.length > 0 ? (
                filteredAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {/* Achievement Card */}
                    <div
                      className={`bg-black/40 backdrop-blur-sm border ${getRarityBorder(
                        achievement.rarity,
                      )} rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/20 ${
                        achievement.earned ? "" : "opacity-80"
                      } relative`}
                    >
                      {/* Coin animation for claiming rewards - would be triggered by button click */}
                      {/* TODO */}

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-mono text-white">{achievement.name}</h3>
                          <span className={`text-xs font-mono uppercase ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </span>
                        </div>

                        <div className="flex items-center mb-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300 mr-2">
                            {getCategoryIcon(achievement.category)}
                            <span className="ml-1 capitalize">{achievement.category}</span>
                          </span>

                          {achievement.earned ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-green-500/20 text-green-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Earned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              In Progress
                            </span>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mb-4 font-mono">{achievement.description}</p>

                        {/* Coin reward display */}
                        <div className="flex items-center mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-500 mr-1.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-mono text-yellow-100 font-medium">{achievement.coinReward} coins reward</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-700/30 rounded-full h-2 mb-4">
                          <div
                            className={`h-2 rounded-full ${
                              achievement.earned
                                ? "bg-gradient-to-r from-green-500 to-green-400"
                                : "bg-gradient-to-r from-cyan-500 to-blue-600"
                            }`}
                            style={{ width: `${Math.min(100, Math.round((achievement.progress / achievement.total) * 100))}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm font-mono text-gray-400">
                            {achievement.progress} / {achievement.total}
                          </div>

                          {achievement.earned ? (
                            achievement.claimed ? (
                              <div className="text-sm font-mono text-gray-400">
                                Earned on {formatDate(achievement.earnedDate)}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleClaimReward(achievement.id)}
                                className="px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Claim Reward
                              </button>
                            )
                          ) : (
                            <div className="text-sm font-mono text-gray-400">
                              {Math.min(100, Math.round((achievement.progress / achievement.total) * 100))}% complete
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <h3 className="text-xl font-mono text-gray-400 mb-2">No achievements found</h3>
                  <p className="text-gray-500 font-mono text-sm max-w-md mb-6">
                    {searchQuery
                      ? "No achievements match your search criteria. Try a different search term."
                      : activeCategory !== "all"
                        ? `You don't have any ${activeCategory} achievements yet.`
                        : activeFilter === "earned"
                          ? "You haven't earned any achievements yet. Keep building your habits!"
                          : "No achievements found with the current filters."}
                  </p>
                </motion.div>
              )
            ) : (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 shadow-lg animate-pulse"
                >
                  <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-2/3 mb-4"></div>
                  <div className="h-2 bg-gray-700/50 rounded w-full mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}