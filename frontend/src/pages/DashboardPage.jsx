/**
 * /pages/DashboardPage.jsx
 * 
 * Dashboard page component for Momentum
 * Displays user's habits and stats after authentication
 * Fetches data from the API and updates in real-time
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

export default function DashboardPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [habits, setHabits] = useState([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [coins, setCoins] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newHabit, setNewHabit] = useState({
    title: "",
    description: "",
    frequency: "daily",
    category: "wellness",
    timeOfDay: "any",
    difficulty: "medium",
    color: "#00DCFF",
    coinReward: 10
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  // Check for authentication token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    
    // If no auth token, redirect to login page
    if (!authToken) {
      router.push("/login")
      return
    }
    
    // Fetch habits and inventory data
    const fetchUserData = async () => {
      try {
        // Fetch habits
        const habitsResponse = await fetch("http://127.0.0.1:5000/habits", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        })
        
        if (habitsResponse.ok) {
          const habitsData = await habitsResponse.json()
          setHabits(habitsData.habits || [])
        } else {
          console.error("Failed to fetch habits")
        }
        
        // Fetch inventory (for coins)
        const inventoryResponse = await fetch("http://127.0.0.1:5000/inventory", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        })
        
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json()
          setCoins(inventoryData.coins || 0)
        } else {
          console.error("Failed to fetch inventory")
        }
        
        setIsLoaded(true)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setIsLoaded(true)
      }
    }
    
    fetchUserData()
  }, [router])

  // Create new habit
  const handleCreateHabit = async () => {
    if (!newHabit.title) {
      setError("Title is required")
      return
    }
    
    setIsCreating(true)
    setError("")
    
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) return
      
      const response = await fetch("http://127.0.0.1:5000/habits", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newHabit)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Add new habit to state
        setHabits(prevHabits => [...prevHabits, data.habit])
        
        // Reset form and close modal
        setNewHabit({
          title: "",
          description: "",
          frequency: "daily",
          category: "wellness",
          timeOfDay: "any",
          difficulty: "medium",
          color: "#00DCFF",
          coinReward: 10
        })
        setShowCreateModal(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create habit")
      }
    } catch (error) {
      console.error("Error creating habit:", error)
      setError("An error occurred. Please try again.")
    }
    
    setIsCreating(false)
  }

  // Handle toggling habit completion
  const handleToggleComplete = async (id) => {
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) return
      
      const habit = habits.find(h => h.id === id)
      
      if (habit.completedToday) {
        // If already completed, do nothing
        return
      } else {
        // Mark as completed via API
        const response = await fetch(`http://127.0.0.1:5000/habits/${id}/complete`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Update habits with the completed habit
          setHabits(habits.map((h) => {
            if (h.id === id) {
              return data.habit
            }
            return h
          }))
          
          // Update coins with reward
          setCoins(data.currentCoins)
        } else {
          console.error("Failed to complete habit")
        }
      }
    } catch (error) {
      console.error("Error toggling habit completion:", error)
    }
  }

  // Delete habit
  const handleDeleteHabit = async (id) => {
    if (!confirm("Are you sure you want to delete this habit?")) return
    
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) return
      
      const response = await fetch(`http://127.0.0.1:5000/habits/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        // Remove habit from state
        setHabits(habits.filter(habit => habit.id !== id))
      } else {
        console.error("Failed to delete habit")
      }
    } catch (error) {
      console.error("Error deleting habit:", error)
    }
  }

  // Filter habits based on active filter and search query
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
  const longestStreak = Math.max(...habits.map((habit) => habit.streak || 0), 0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-black/30 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
            <svg
              viewBox="0 0 1380 1090"
              className="w-full h-full fill-white"
              style={{ transform: 'scaleY(-1)' }}
            >
              <path d={MOMENTUM_LOGO_PATH} />
            </svg>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-sm rounded-full"></div>
            </div>
            <span className="text-white font-mono text-lg tracking-tight">Momentum</span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Coin display - Now showing real data from the database */}
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
              <ProfileDropdown/>
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
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-fuchsia-500">Today</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-900/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-300 font-mono text-sm">Total Habits</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-fuchsia-400"
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

            <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-900/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-300 font-mono text-sm">Completed Today</h3>
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

            <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-900/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-300 font-mono text-sm">Completion Rate</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-fuchsia-400"
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

            <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-900/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-300 font-mono text-sm">Longest Streak</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-orange-400"
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
                  ? "bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 text-white"
                  : "bg-black/40 border border-purple-900/60 text-gray-300 hover:text-white"
              }`}
            >
              All Habits
            </button>
            <button
              onClick={() => setActiveFilter("daily")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeFilter === "daily"
                  ? "bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 text-white"
                  : "bg-black/40 border border-purple-900/60 text-gray-300 hover:text-white"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveFilter("weekly")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeFilter === "weekly"
                  ? "bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 text-white"
                  : "bg-black/40 border border-purple-900/60 text-gray-300 hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveFilter("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeFilter === "monthly"
                  ? "bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 text-white"
                  : "bg-black/40 border border-purple-900/60 text-gray-300 hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex items-center w-full md:w-64">
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pr-10 pl-4 bg-black/40 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 hover:from-fuchsia-400 hover:to-fuchsia-300 text-white px-4 py-2 rounded-md transition-all duration-300 text-sm font-mono shadow-lg flex items-center"
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

        {/* Habits Grid - using real data from API */}
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
                      className="bg-purple-900/20 backdrop-blur-sm border border-purple-900/30 rounded-lg p-6 shadow-lg relative overflow-hidden group"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: habit.color || "#00DCFF",
                      }}
                    >
                      {/* Improved completion indicator that matches the design */}
                      {habit.completedToday && (
                        <div className="absolute top-3 right-3 flex items-center justify-between">
                          <div className="bg-green-500 text-white py-1 px-2 rounded-md font-mono text-xs flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </div>
                          {/* Move delete button next to completion status when completed */}
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="ml-2 text-gray-400 hover:text-red-400 transition-colors duration-300 focus:outline-none"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: habit.color || "#00DCFF" }}
                          ></div>
                          <h3 className="text-lg font-mono text-white">{habit.title}</h3>
                        </div>
                        {/* Only show delete button here if not completed */}
                        {!habit.completedToday && (
                          <div className="relative">
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors duration-300 focus:outline-none"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-4 font-mono">{habit.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-900/30 text-gray-200">
                          <span className="capitalize">{habit.category}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-900/30 text-gray-200">
                          <span className="capitalize">{habit.timeOfDay ? habit.timeOfDay.replace("-", " ") : "Any"}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-900/30 text-gray-200">
                          <span className="capitalize">{habit.frequency}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-900/30 text-gray-200">
                          <span className="capitalize">{habit.difficulty || "medium"}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-yellow-500/20 text-yellow-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {habit.coinReward || 10} coins
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
                            <span className="text-sm font-mono text-gray-300">{habit.streak || 0} streak</span>
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
                            <span className="text-sm font-mono text-gray-300">{habit.totalCompletions || 0} total</span>
                          </div>
                        </div>

                        {!habit.completedToday && (
                          <button
                            onClick={() => handleToggleComplete(habit.id)}
                            className="bg-green-600 text-white hover:bg-green-500 px-3 py-1.5 rounded-md text-xs font-mono transition-colors duration-300 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Complete
                          </button>
                        )}
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

      {/* Create Habit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-black/80 border border-white/10 rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-mono text-white">Create New Habit</h2>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-sm font-mono">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newHabit.title}
                    onChange={(e) => setNewHabit({...newHabit, title: e.target.value})}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                    placeholder="e.g. Morning Meditation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm h-20 resize-none"
                    placeholder="Describe your habit..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-1">Frequency</label>
                    <select
                      value={newHabit.frequency}
                      onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-1">Category</label>
                    <select
                      value={newHabit.category}
                      onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                    >
                      <option value="wellness">Wellness</option>
                      <option value="health">Health</option>
                      <option value="productivity">Productivity</option>
                      <option value="learning">Learning</option>
                      <option value="finance">Finance</option>
                      <option value="social">Social</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-1">Time of Day</label>
                    <select
                      value={newHabit.timeOfDay}
                      onChange={(e) => setNewHabit({...newHabit, timeOfDay: e.target.value})}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                    >
                      <option value="any">Any Time</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-1">Difficulty</label>
                    <select
                      value={newHabit.difficulty}
                      onChange={(e) => setNewHabit({...newHabit, difficulty: e.target.value})}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">Coin Reward</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newHabit.coinReward}
                      onChange={(e) => setNewHabit({...newHabit, coinReward: parseInt(e.target.value) || 10})}
                      className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white font-mono text-sm"
                    />
                    <div className="flex items-center ml-2 bg-black/40 border border-yellow-500/30 rounded-full px-2 py-1">
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
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-1">Color</label>
                  <div className="flex space-x-2">
                    {["#00DCFF", "#22C55E", "#F97316", "#3B82F6", "#9333EA", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewHabit({...newHabit, color})}
                        className={`w-8 h-8 rounded-full ${newHabit.color === color ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-gray-300 hover:text-white transition-colors duration-300 text-sm font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateHabit}
                    disabled={isCreating || !newHabit.title}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-md transition-all duration-300 text-sm font-mono shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Habit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}