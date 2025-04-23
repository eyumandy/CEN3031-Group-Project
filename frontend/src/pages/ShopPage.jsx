"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MOMENTUM_LOGO_PATH } from "../constants/momentum-logo-path"
import NotificationDropdown from "../components/NotificationDropdown"
import ProfileDropdown from "../components/ProfileDropdown"

export default function ShopPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [coins, setCoins] = useState(0)
  const [shopItems, setShopItems] = useState([])
  const [ownedItems, setOwnedItems] = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState("")

  // Check for authentication token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    
    // If no auth token, redirect to login page
    if (!authToken) {
      router.push("/login")
      return
    }
    
    // Fetch shop data and user inventory
    const fetchShopData = async () => {
      try {
        // Fetch user inventory to get coins and owned items
        const inventoryResponse = await fetch("http://127.0.0.1:5000/inventory", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        })
        
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json()
          setCoins(inventoryData.coins || 0)
          setOwnedItems(inventoryData.items || [])
        }
        
        // Set predefined shop items
        setShopItems([
          {
            id: "theme-1",
            name: "Dark Minimal Theme",
            description: "Sleek dark theme with minimalist design",
            price: 120,
            category: "themes",
            image: "/themes/dark-minimal.png",
            rarity: "rare",
            themeId: "darkMinimal",
          },
          {
            id: "theme-2",
            name: "Neon Synthwave Theme",
            description: "Vibrant neon colors with retro synthwave aesthetics",
            price: 150,
            category: "themes",
            image: "/themes/synthwave-theme.png",
            rarity: "epic",
            themeId: "neonSynthwave",
          },
          {
            id: "theme-3",
            name: "Calm Pastel Theme",
            description: "Soft pastel colors for a calm experience",
            price: 100,
            category: "themes",
            image: "/themes/pastel-theme.png",
            rarity: "uncommon",
            themeId: "calmPastel",
          },
          {
            id: "theme-4",
            name: "Nature Theme",
            description: "Calming green tones inspired by forests and nature",
            price: 120,
            category: "themes",
            image: "/themes/nature-theme.png",
            rarity: "rare",
            themeId: "nature",
          },
          {
            id: "theme-5",
            name: "Ocean Theme",
            description: "Serene blue gradients reminiscent of ocean depths",
            price: 120,
            category: "themes",
            image: "/themes/ocean-theme.png",
            rarity: "rare",
            themeId: "ocean",
          },
          {
            id: "theme-6",
            name: "Midnight Galaxy Theme",
            description: "Deep space-inspired theme with stars and galaxies",
            price: 180,
            category: "themes",
            image: "/themes/galaxy-theme.png",
            rarity: "epic",
            themeId: "midnightGalaxy",
          },
          {
            id: "theme-7",
            name: "Cyberpunk Theme",
            description: "High-tech, low-life aesthetic with neon and dystopian vibes",
            price: 200,
            category: "themes",
            image: "/themes/cyberpunk-theme.png",
            rarity: "legendary",
            themeId: "cyberpunk",
          },
          {
            id: "theme-8",
            name: "Minimalist Light Theme",
            description: "Clean, bright interface with subtle accents for a distraction-free experience",
            price: 120,
            category: "themes",
            image: "/themes/minimalist-light.png",
            rarity: "rare",
            themeId: "minimalistLight",
          },
          {
            id: "theme-9",
            name: "Sunset Gradient Theme",
            description: "Warm sunset colors transitioning from orange to purple",
            price: 140,
            category: "themes",
            image: "/themes/sunset-gradient.png",
            rarity: "epic",
            themeId: "sunsetGradient",
          },
          {
            id: "theme-10",
            name: "Forest Mist Theme",
            description: "Foggy forest-inspired colors with a serene atmosphere",
            price: 130,
            category: "themes",
            image: "/themes/forest-mist.png",
            rarity: "rare",
            themeId: "forestMist",
          },
          {
            id: "theme-11",
            name: "Desert Sands Theme",
            description: "Warm and earthy tones inspired by desert landscapes",
            price: 110,
            category: "themes",
            image: "/themes/desert-sands.png",
            rarity: "uncommon",
            themeId: "desertSands",
          },
          {
            id: "theme-12",
            name: "Cherry Blossom Theme",
            description: "Delicate pink and white colors inspired by Japanese sakura",
            price: 160,
            category: "themes",
            image: "/themes/cherry-blossom.png",
            rarity: "epic",
            themeId: "cherryBlossom",
          },
          {
            id: "theme-13",
            name: "Monochrome Theme",
            description: "Classic black and white interface with sharp contrast",
            price: 90,
            category: "themes",
            image: "/themes/monochrome.png",
            rarity: "uncommon",
            themeId: "monochrome",
          },
          {
            id: "theme-14",
            name: "Northern Lights Theme",
            description: "Inspired by the aurora borealis with cyan, green, and violet",
            price: 190,
            category: "themes",
            image: "/themes/northern-lights.png",
            rarity: "legendary",
            themeId: "northernLights",
          },
          {
            id: "theme-15",
            name: "Vintage Paper Theme",
            description: "Old-school aesthetic with warm papyrus tones and aged details",
            price: 150,
            category: "themes",
            image: "/themes/vintage-paper.png",
            rarity: "epic",
            themeId: "vintagePaper",
          },
          {
            id: "powerup-1",
            name: "Streak Shield",
            description: "Protects your streak once if you miss a day",
            price: 150,
            category: "powerups",
            image: "/powerups/streak-shield.png",
            rarity: "epic",
            usageLimit: 1,
          },
          {
            id: "powerup-2",
            name: "2x Coin Multiplier",
            description: "Double your coin earnings for completed habits for 3 days",
            price: 250,
            category: "powerups",
            image: "/powerups/coin-multiplier.png",
            rarity: "epic",
            duration: "3 days",
          },
          {
            id: "powerup-3",
            name: "Flexible Day",
            description: "Mark a habit as complete without actually doing it",
            price: 100,
            category: "powerups",
            image: "/powerups/flexible-day.png",
            rarity: "rare",
            usageLimit: 3,
          },
          {
            id: "powerup-4",
            name: "All-in-One",
            description: "Complete all your habits at once with a single click",
            price: 200,
            category: "powerups",
            image: "/powerups/all-in-one.png",
            rarity: "epic",
            usageLimit: 1,
          },
          {
            id: "powerup-5",
            name: "Bonus Coins",
            description: "Instantly receive 50 bonus coins",
            price: 100,
            category: "powerups",
            image: "/powerups/bonus-coins.png",
            rarity: "uncommon",
            usageLimit: 1,
          },
          {
            id: "background-1",
            name: "Mountain Landscape",
            description: "A serene mountain landscape for your dashboard background",
            price: 80,
            category: "backgrounds",
            image: "/backgrounds/mountain.png",
            rarity: "uncommon",
          },
          {
            id: "background-2",
            name: "Space Background",
            description: "A stunning space background with stars and nebulae",
            price: 90,
            category: "backgrounds",
            image: "/backgrounds/space.png",
            rarity: "uncommon",
          },
          {
            id: "background-3",
            name: "Urban Cityscape",
            description: "Modern city skyline for an urban aesthetic",
            price: 85,
            category: "backgrounds",
            image: "/backgrounds/cityscape.png",
            rarity: "uncommon",
          },
        ])
        
        setIsLoaded(true)
      } catch (error) {
        console.error("Error fetching shop data:", error)
        setIsLoaded(true)
      }
    }
    
    fetchShopData()
  }, [router])

  // Check if an item is already owned
  const isItemOwned = (itemId) => {
    return ownedItems.some(item => item.id === itemId)
  }

  // Handle purchase confirmation
  const handlePurchase = async () => {
    if (!selectedItem) return
    
    // Verify the user has enough coins
    if (coins < selectedItem.price) {
      setPurchaseError("You don't have enough coins to purchase this item")
      return
    }
    
    setIsPurchasing(true)
    setPurchaseError("")
    
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) {
        router.push("/login")
        return
      }
      
      const response = await fetch("http://127.0.0.1:5000/inventory/purchase", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedItem)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        setCoins(data.currentCoins)
        setOwnedItems(prev => [...prev, data.item])
        
        // Close the modal
        setSelectedItem(null)
        
      } else {
        const errorData = await response.json()
        setPurchaseError(errorData.error || "Failed to purchase item")
      }
    } catch (error) {
      console.error("Error purchasing item:", error)
      setPurchaseError("An error occurred during purchase. Please try again.")
    }
    
    setIsPurchasing(false)
  }

  // Filter items based on active category and search query
  const filteredItems = shopItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Function to get the color associated with an item's rarity
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

  // Function to get the border color associated with an item's rarity
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

  // Function to get an icon for the item's category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "themes":
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
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        )
      case "powerups":
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
      case "backgrounds":
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        )
    }
  }

  // Direct color styles for rarity, using inline styles as a fallback
  const getRarityColorStyle = (rarity) => {
    switch (rarity) {
      case "common":
        return "#D1D5DB"; // text-gray-300 equivalent
      case "uncommon":
        return "#34D399"; // text-green-400 equivalent
      case "rare":
        return "#60A5FA"; // text-blue-400 equivalent  
      case "epic":
        return "#A78BFA"; // text-purple-400 equivalent
      case "legendary":
        return "#FBBF24"; // text-yellow-400 equivalent
      default:
        return "#D1D5DB"; // default gray
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-black/80 to-black/30 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
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
              <Link href="/shop" className="text-sm font-medium relative text-cyan-400">
                Shop
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>
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
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Shop Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-mono font-light mb-6">
            Momentum
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Shop</span>
          </h1>

          <p className="text-gray-400 max-w-3xl font-mono text-sm mb-6">
            Spend your hard-earned coins on themes, powerups, and backgrounds to customize your experience and boost
            your productivity.
          </p>
        </motion.div>

        {/* Category Filters and Search */}
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
              All Items
            </button>
            <button
              onClick={() => setActiveCategory("themes")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeCategory === "themes"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Themes
            </button>
            <button
              onClick={() => setActiveCategory("powerups")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeCategory === "powerups"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Powerups
            </button>
            <button
              onClick={() => setActiveCategory("backgrounds")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all duration-300 ${
                activeCategory === "backgrounds"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-black/40 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Backgrounds
            </button>
          </div>

          <div className="relative flex items-center w-full md:w-64">
            <input
              type="text"
              placeholder="Search shop..."
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
        </motion.div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isLoaded ? (
              filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {/* Shop Item Card */}
                    <div
                      className={`bg-black/40 backdrop-blur-sm border ${getRarityBorder(item.rarity)} rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/20`}
                    >
                      {/* Item Image - placeholder with emoji */}
                      <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-4xl text-gray-600">
                          {item.category === "themes" && "🎨"}
                          {item.category === "powerups" && "⚡"}
                          {item.category === "backgrounds" && "🖼️"}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-mono text-white">{item.name}</h3>
                          {/* Use inline style as a fallback for the rarity text color */}
                          <span 
                            className={`text-xs font-mono uppercase ${getRarityColor(item.rarity)}`}
                            style={{ color: getRarityColorStyle(item.rarity) }}
                          >
                            {item.rarity}
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300 mr-2">
                            {getCategoryIcon(item.category)}
                            <span className="ml-1 capitalize">{item.category}</span>
                          </span>

                          {item.duration && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300">
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
                              {item.duration}
                            </span>
                          )}

                          {item.usageLimit && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300">
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
                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                              </svg>
                              {item.usageLimit} {item.usageLimit === 1 ? 'use' : 'uses'}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mb-4 font-mono">{item.description}</p>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-yellow-500 mr-1"
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
                          <span className="font-mono text-white font-medium">{item.price}</span>
                        </div>

                        {isItemOwned(item.id) ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center bg-green-500/20 text-green-400 cursor-default"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Owned
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedItem(item)}
                            disabled={coins < item.price}
                            className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center ${
                              coins >= item.price
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                                : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {coins >= item.price ? (
                              <>
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
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Purchase
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
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                                Not enough
                              </>
                            )}
                          </button>
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-xl font-mono text-gray-400 mb-2">No items found</h3>
                <p className="text-gray-500 font-mono text-sm max-w-md mb-6">
                  {searchQuery
                    ? "No items match your search criteria. Try a different search term."
                    : activeCategory !== "all"
                      ? `We don't have any ${activeCategory} items available right now. Check back later!`
                      : "Our shop is currently empty. Check back later for new items!"}
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
                <div className="h-40 bg-gray-700/50 rounded w-full mb-4"></div>
                <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </main>

    {/* Purchase Confirmation Modal */}
    {selectedItem && (
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
              <h2 className="text-xl font-mono text-white">Confirm Purchase</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors duration-300">
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
            
            {purchaseError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-sm font-mono">
                {purchaseError}
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                {/* Placeholder image with emoji */}
                <div className="h-32 w-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-4xl text-gray-600">
                    {selectedItem.category === "themes" && "🎨"}
                    {selectedItem.category === "powerups" && "⚡"}
                    {selectedItem.category === "backgrounds" && "🖼️"}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-mono text-white text-center mb-1">{selectedItem.name}</h3>
              <p className="text-center text-xs font-mono uppercase mb-4">
                {/* Use inline style for consistent color display */}
                <span 
                  className={`${getRarityColor(selectedItem.rarity)}`}
                  style={{ color: getRarityColorStyle(selectedItem.rarity) }}
                >
                  {selectedItem.rarity}
                </span>
              </p>
              <p className="text-gray-400 text-sm text-center mb-4 font-mono">{selectedItem.description}</p>

              <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
                <div>
                  <p className="text-sm font-mono text-gray-400">Price</p>
                  <div className="flex items-center">
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
                    <span className="font-mono text-white font-medium">{selectedItem.price}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-mono text-gray-400">Your Balance</p>
                  <div className="flex items-center">
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
                    <span className="font-mono text-white font-medium">{coins}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-mono text-gray-400">Remaining</p>
                  <div className="flex items-center">
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
                    <span className={`font-mono font-medium ${coins - selectedItem.price < 0 ? "text-red-400" : "text-white"}`}>
                      {coins - selectedItem.price}
                    </span>
                  </div>
                </div>
              </div>

              {coins < selectedItem.price && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-sm font-mono">
                  You don't have enough coins to purchase this item. Complete more habits to earn coins!
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-gray-300 hover:text-white transition-colors duration-300 text-sm font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={isPurchasing || coins < selectedItem.price}
                className={`px-4 py-2 rounded-md transition-all duration-300 text-sm font-mono ${
                  coins >= selectedItem.price
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                    : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPurchasing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </div>
)
}