/**
 * Dashboard page component for Momentum
 * 
 * Displays user's habits, stats, and activity after successful login
 * Provides navigation to other app areas like achievements, inventory, and shop
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
import { MOMENTUM_LOGO_PATH } from "../constants/momentum-logo-path"
import NotificationDropdown from "../components/NotificationDropdown"
import ProfileDropdown from "../components/ProfileDropdown"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [habits, setHabits] = useState([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [coins, setCoins] = useState(150) // Starting coins for the user
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Check for authentication token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    
    // If no auth token, redirect to login page
    if (!authToken) {
      router.push("/login")
      return
    }
    
    // Fetch user data and habits if authenticated
    // TODO: API calls to get the user's data
    
    // Simulation until real backend implementation
    setTimeout(() => {
      setHabits([
        {
          id: "1",
          title: "Morning Meditation",
          description: "10 minutes of mindfulness meditation",
          frequency: "daily",
          streak: 5,
          totalCompletions: 12,
          category: "wellness",
          createdAt: new Date("2023-03-01"),
          completedToday: true,
          timeOfDay: "morning",
          color: "#00DCFF",
          difficulty: "medium",
          coinReward: 10,
        },
        {
          id: "2",
          title: "Read Technical Articles",
          description: "Read at least one technical article to stay updated",
          frequency: "daily",
          streak: 3,
          totalCompletions: 8,
          category: "learning",
          createdAt: new Date("2023-03-05"),
          completedToday: false,
          timeOfDay: "evening",
          color: "#9333EA",
          difficulty: "easy",
          coinReward: 5,
        },
        {
          id: "3",
          title: "Weekly Review",
          description: "Review goals and plan for the next week",
          frequency: "weekly",
          streak: 2,
          totalCompletions: 6,
          category: "productivity",
          createdAt: new Date("2023-02-15"),
          completedToday: false,
          timeOfDay: "evening",
          color: "#22C55E",
          difficulty: "hard",
          coinReward: 15,
        },
        {
          id: "4",
          title: "Exercise",
          description: "30 minutes of cardio or strength training",
          frequency: "daily",
          streak: 0,
          totalCompletions: 20,
          category: "health",
          createdAt: new Date("2023-01-10"),
          completedToday: false,
          timeOfDay: "afternoon",
          color: "#F97316",
          difficulty: "medium",
          coinReward: 10,
        },
        {
          id: "5",
          title: "Drink Water",
          description: "Drink at least 8 glasses of water",
          frequency: "daily",
          streak: 7,
          totalCompletions: 30,
          category: "health",
          createdAt: new Date("2023-01-05"),
          completedToday: true,
          timeOfDay: "all-day",
          color: "#3B82F6",
          difficulty: "easy",
          coinReward: 5,
        },
      ])
      setIsLoaded(true)
    }, 800)
  }, [router])

  const handleToggleComplete = (id) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          const wasCompleted = habit.completedToday

          // If marking as complete, award coins
          if (!wasCompleted) {
            // Base reward is the habit's coinReward or default to 10
            let reward = habit.coinReward || 10

            // Bonus for streaks
            if (habit.streak >= 5) reward += 5
            if (habit.streak >= 10) reward += 5
            if (habit.streak >= 30) reward += 10

            // Update total coins
            setCoins((prevCoins) => prevCoins + reward)
          }

          return {
            ...habit,
            completedToday: !wasCompleted,
            streak: !wasCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            totalCompletions: !wasCompleted ? habit.totalCompletions + 1 : habit.totalCompletions,
          }
        }
        return habit
      }),
    )
  }

  const filteredHabits = habits.filter((habit) => {
    const matchesFilter = activeFilter === "all" || habit.frequency === activeFilter
    const matchesSearch =
      habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Stats calculation
  const totalHabits = habits.length
  const completedToday = habits.filter((habit) => habit.completedToday).length
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
  const longestStreak = Math.max(...habits.map((habit) => habit.streak), 0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-black/30 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <svg viewBox="0 0 1380 1090" className="w-full h-full fill-white">
                <path d={MOMENTUM_LOGO_PATH} />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-sm rounded-full"></div>
            </div>
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
              <a href="#" className="text-sm font-medium relative text-cyan-400">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>
              </a>
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
              <Link
                href="/achievements"
                className="text-sm font-medium relative text-gray-300 hover:text-white transition-colors duration-300"
              >
                Achievements
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
              <ProfileDropdown userName="John Smith" userEmail="user@momentum.app" userInitials="JS" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header with Stats */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-mono font-light mb-6">
            Your Habit Dashboard
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Today</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-mono text-sm">Total Habits</h3>
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-2xl font-mono mt-2">{totalHabits}</p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-mono text-sm">Completed Today</h3>
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
                {completedToday} / {totalHabits}
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

            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 font-mono text-sm">Longest Streak</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-2xl font-mono mt-2">{longestStreak} days</p>
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
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeFilter === "all"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              All Habits
            </button>
            <button
              onClick={() => setActiveFilter("daily")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeFilter === "daily"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveFilter("weekly")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeFilter === "weekly"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Weekly
            </button>
          </div>

          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search habits..."
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-md transition-all duration-300 text-sm font-mono shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Habit
            </button>
          </div>
        </motion.div>

        {/* Habits Grid - Placeholder cards for now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isLoaded ? (
              filteredHabits.length > 0 ? (
                filteredHabits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div
                      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 shadow-lg relative overflow-hidden group"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: habit.color,
                      }}
                    >
                      {/* Completion indicator */}
                      {habit.completedToday && (
                        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 bg-green-500 text-white py-1 px-8 text-xs font-mono">
                            Done
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-mono text-white">{habit.title}</h3>
                        <div className="relative">
                          <button
                            className="text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 font-mono">{habit.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300">
                          <span className="ml-1 capitalize">{habit.category}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300">
                          <span className="ml-1 capitalize">{habit.timeOfDay.replace("-", " ")}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300">
                          <span className="ml-1 capitalize">{habit.frequency}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300">
                          <span className="ml-1">{habit.difficulty}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-yellow-500/20 text-yellow-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {habit.coinReward} coins
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-orange-500 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-sm font-mono text-gray-300">{habit.streak} streak</span>
                          </div>
                          <div className="h-4 w-px bg-gray-700"></div>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-500 mr-1"
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
                            <span className="text-sm font-mono text-gray-300">{habit.totalCompletions} total</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleComplete(habit.id)}
                          className={`${
                            habit.completedToday
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                          } px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center`}
                        >
                          {habit.completedToday ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Completed
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Complete
                            </>
                          )}
                        </button>
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="text-xl font-mono text-gray-400 mb-2">No habits found</h3>
                  <p className="text-gray-500 font-mono text-sm max-w-md mb-6">
                    {searchQuery
                      ? "No habits match your search criteria. Try a different search term."
                      : activeFilter !== "all"
                        ? `You don't have any ${activeFilter} habits yet.`
                        : "You haven't created any habits yet. Start building momentum by creating your first habit."}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2 rounded-md transition-all duration-300 text-sm font-mono shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Habit
                  </button>
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