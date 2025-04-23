/**
 * InventoryPage.jsx
 * 
 * Inventory page component for Momentum
 * Displays user's owned items and allows them to use/activate them
 * 
 * @dependencies
 *  - next/navigation
 *  - react hooks
 *  - framer-motion
 *  - ThemeContext
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MOMENTUM_LOGO_PATH } from "../constants/momentum-logo-path"
import NotificationDropdown from "../components/NotificationDropdown"
import ProfileDropdown from "../components/ProfileDropdown"
import { useTheme } from '../contexts/ThemeContext';

export default function InventoryPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [coins, setCoins] = useState(0)
  const [inventoryItems, setInventoryItems] = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUsingItem, setIsUsingItem] = useState(false)
  
  // Get theme context
  const themeContext = useTheme();
  
  // Check for authentication token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    
    // If no auth token, redirect to login page
    if (!authToken) {
      router.push("/login")
      return
    }
    
    // Fetch inventory data
    const fetchInventoryData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/inventory", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setCoins(data.coins || 0)
          setInventoryItems(data.items || [])
          
          // Check for active theme
          const activeTheme = data.items.find(item => 
            item.category === "themes" && item.isActive
          )
          
          // Apply active theme if found and theme context is available
          if (activeTheme && themeContext) {
            themeContext.applyTheme(activeTheme.themeId);
          }
        } else {
          console.error("Failed to fetch inventory")
        }
        
        setIsLoaded(true)
      } catch (error) {
        console.error("Error fetching inventory:", error)
        setIsLoaded(true)
      }
    }
    
    fetchInventoryData()
  }, [router, themeContext]) 

  // Handle using/activating items
  const handleUseItem = async (item) => {
    setIsUsingItem(true);
    
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        router.push("/login");
        return;
      }
      
      // Make API call first
      const response = await fetch("http://127.0.0.1:5000/inventory/use", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemId: item.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (item.category === "themes") {
          // Update inventory items to reflect the active theme
          setInventoryItems(prevItems => 
            prevItems.map(i => ({
              ...i,
              isActive: i.category === "themes" ? i.id === item.id : i.isActive
            }))
          );
          
          // Apply theme AFTER updating state
          if (themeContext && themeContext.applyTheme) {
            // Small delay to avoid conflicts
            setTimeout(() => {
              themeContext.applyTheme(item.themeId);
            }, 50);
          }
        } else if (item.category === "powerups") {
          // For powerups that affect coins
          if (item.id === "powerup-5") { // Bonus Coins
            setCoins(data.currentCoins);
            
            // Remove used powerup
            setInventoryItems(prevItems => 
              prevItems.filter(i => i.id !== item.id)
            );
            
            alert(`You received 50 bonus coins!`);
          } else {
            // For other powerups
            if (item.usageLimit === 1) {
              // Remove one-time use powerups
              setInventoryItems(prevItems => 
                prevItems.filter(i => i.id !== item.id)
              );
            } else {
              // Decrease usesLeft for multi-use powerups
              setInventoryItems(prevItems => 
                prevItems.map(i => {
                  if (i.id === item.id) {
                    return {
                      ...i,
                      usesLeft: (i.usesLeft || item.usageLimit) - 1
                    };
                  }
                  return i;
                })
              );
            }
            
            alert(`${item.name} has been activated!`);
          }
        } else if (item.category === "backgrounds") {
          // Update inventory items to reflect the active background
          setInventoryItems(prevItems => 
            prevItems.map(i => ({
              ...i,
              isActive: i.category === "backgrounds" ? i.id === item.id : i.isActive
            }))
          );
          
          alert(`${item.name} has been applied!`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to use item");
      }
    } catch (error) {
      console.error("Error using item:", error);
      alert("An error occurred. Please try again.");
    }
    
    setIsUsingItem(false);
  }
  // Filter items based on active category and search query
  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
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

// Function to get the action button based on item category and state
const getActionButton = (item) => {
  if (item.category === "themes") {
    const isActive = item.isActive
    return (
      <button
        onClick={() => handleUseItem(item)}
        disabled={isUsingItem || isActive}
        className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center ${
          isActive
            ? "bg-green-500/20 text-green-400 cursor-default"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        }`}
      >
        {isActive ? (
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
            Applied
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
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            Apply Theme
          </>
        )}
      </button>
    )
  } else if (item.category === "powerups") {
    const usesLeft = item.usesLeft || item.usageLimit || 1
    return (
      <button 
        onClick={() => handleUseItem(item)}
        disabled={isUsingItem}
        className="px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUsingItem ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Using...
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {usesLeft > 1 ? `Activate (${usesLeft} uses left)` : 'Activate'}
          </>
        )}
      </button>
    )
  } else if (item.category === "backgrounds") {
    const isActive = item.isActive
    return (
      <button 
        onClick={() => handleUseItem(item)}
        disabled={isUsingItem || isActive}
        className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center ${
          isActive
            ? "bg-green-500/20 text-green-400 cursor-default"
            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        }`}
      >
        {isActive ? (
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
            Applied
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Set Background
          </>
        )}
      </button>
    )
  } else {
    return (
      <button 
        onClick={() => handleUseItem(item)}
        disabled={isUsingItem}
        className="px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-300 flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
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
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        Use
      </button>
    )
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
              <Link href="/inventory" className="text-sm font-medium relative text-cyan-400">
                Inventory
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>
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
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Inventory Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-mono font-light mb-6">
          Your
          <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Inventory
          </span>
        </h1>

        <p className="text-gray-400 max-w-3xl font-mono text-sm mb-6">
          View and manage your purchased items. Activate powerups, apply themes, and equip backgrounds to customize your
          experience.
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

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search inventory..."
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
      </motion.div>

      {/* Inventory Items Grid */}
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
                  {/* Inventory Item Card */}
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
                        <span className={`text-xs font-mono uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
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

                        {(item.usageLimit || item.usesLeft) && (
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
                            {item.usesLeft || item.usageLimit} {(item.usesLeft || item.usageLimit) === 1 ? 'use' : 'uses'} left
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-4 font-mono">{item.description}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
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
                            {new Date(item.purchasedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {getActionButton(item)}
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="text-xl font-mono text-gray-400 mb-2">Your inventory is empty</h3>
                <p className="text-gray-500 font-mono text-sm max-w-md mb-6">
                  {searchQuery
                    ? "No items match your search criteria. Try a different search term."
                    : activeCategory !== "all"
                      ? `You don't have any ${activeCategory} items yet.`
                      : "You haven't purchased any items yet. Visit the shop to get started!"}
                </p>
                <Link
                  href="/shop"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2 rounded-md transition-all duration-300 text-sm font-mono shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
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
                  Go to Shop
                </Link>
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
  </div>
)
}