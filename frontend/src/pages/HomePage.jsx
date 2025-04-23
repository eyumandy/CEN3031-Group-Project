/**
 * 
 * @description Main landing page component for the Momentum web application
 * @version 1.0
 * @dependencies 
 *  - react
 *  - framer-motion
 *  - next/link
 */

"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { MOMENTUM_LOGO_PATH } from "../constants/momentum-logo-path"

export default function HomePage() {
  const canvasRef = useRef(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const isTouchingRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [activeSection, setActiveSection] = useState("home")

  // Ref for features section
  const featuresSectionRef = useRef(null)

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const headerHeight = 80 

      if (featuresSectionRef.current) {
        const featuresPosition = featuresSectionRef.current.offsetTop - headerHeight - 100

        if (scrollPosition >= featuresPosition) {
          setActiveSection("features")
        } else {
          setActiveSection("home")
        }
      }
    }

    // Call once on mount to set initial state
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [featuresSectionRef]) // Add dependency

  // Array of phrases to rotate through
  const phrases = [
    "Build lasting habits with Momentum's minimalist approach to personal growth.",
    "Transform your daily routines with focused tracking and accountability.",
    "Achieve more with a simple system that reinforces positive behaviors.",
    "Create a foundation for success with consistent habit building.",
    "Turn small daily actions into powerful long-term results.",
    "Design your ideal routine with Momentum's intuitive tracking system.",
  ]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Animation timing parameters
  const typingSpeed = 80 // ms per character when typing
  const deletionSpeed = 30 // ms per character when deleting
  const pauseDuration = 5000 // ms to pause after typing before deleting
  const cursorBlinkRate = 530 // ms for cursor blink cycle

  // Animation state
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const cursorTimeRef = useRef(0)
  const pauseTimeRef = useRef(null)

  // Text animation using requestAnimationFrame
  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      if (!cursorTimeRef.current) cursorTimeRef.current = timestamp

      const deltaTime = timestamp - lastTimeRef.current
      const cursorDelta = timestamp - cursorTimeRef.current

      // Handle cursor blinking
      if (cursorDelta > cursorBlinkRate) {
        setShowCursor((prev) => !prev)
        cursorTimeRef.current = timestamp
      }

      // Handle text animation
      if (isTyping) {
        const currentPhrase = phrases[currentPhraseIndex]

        if (displayText.length < currentPhrase.length) {
          // Typing phase
          if (deltaTime > typingSpeed) {
            setDisplayText(currentPhrase.slice(0, displayText.length + 1))
            lastTimeRef.current = timestamp
            pauseTimeRef.current = null
          }
        } else {
          // Pause phase after typing is complete
          if (pauseTimeRef.current === null) {
            pauseTimeRef.current = timestamp
          }

          if (timestamp - pauseTimeRef.current > pauseDuration) {
            setIsTyping(false)
            lastTimeRef.current = timestamp
            pauseTimeRef.current = null
          }
        }
      } else {
        // Deletion phase
        if (displayText.length > 0) {
          if (deltaTime > deletionSpeed) {
            setDisplayText((prev) => prev.slice(0, -1))
            lastTimeRef.current = timestamp
          }
        } else {
          // Move to next phrase
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          setIsTyping(true)
          lastTimeRef.current = timestamp
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [displayText, currentPhraseIndex, isTyping, phrases])

  // Canvas effect implementation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setIsMobile(window.innerWidth < 768)
    }

    updateCanvasSize()

    let particles = []

    function createTextImage() {
      if (!ctx || !canvas) return 0

      ctx.fillStyle = "white"
      ctx.save()

      // Increased logo size even more
      const logoHeight = isMobile ? 180 : 260
      const logoWidth = logoHeight * (138 / 109)

      ctx.translate(canvas.width / 2, canvas.height / 2)
      const scale = logoHeight / 1090
      ctx.scale(scale, -scale)
      ctx.translate(-690, -545)

      const path = new Path2D(MOMENTUM_LOGO_PATH)
      ctx.fill(path)
      ctx.restore()

      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      return scale
    }

    let textImageData = null

    function createParticle(scale) {
      if (!ctx || !canvas || !textImageData) return null

      const data = textImageData.data

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width)
        const y = Math.floor(Math.random() * canvas.height)

        if (data[(y * canvas.width + x) * 4 + 3] > 128) {
          return {
            x,
            y,
            baseX: x,
            baseY: y,
            size: Math.random() * 1 + 0.5, // Reduced particle size variation
            color: "white",
            scatteredColor: "#00DCFF",
            life: Math.random() * 100 + 50,
          }
        }
      }

      return null
    }

    let animationFrameId

    function createInitialParticles(scale) {
      if (!ctx || !canvas) return
      const baseParticleCount = 7000
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      )
      for (let i = 0; i < targetParticleCount; i++) {
        const particle = createParticle(scale)
        if (particle) {
          particles.push(particle)
        }
      }
    }

    function animate(scale) {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const { x: mouseX, y: mouseY } = mousePositionRef.current
      const maxDistance = 120 // Reduced interaction distance

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance && (isTouchingRef.current || !("ontouchstart" in window))) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          const moveX = Math.cos(angle) * force * 30 // Reduced movement distance
          const moveY = Math.sin(angle) * force * 30
          p.x = p.baseX - moveX
          p.y = p.baseY - moveY

          ctx.fillStyle = p.scatteredColor
        } else {
          // Simpler movement back to original position
          p.x += (p.baseX - p.x) * 0.2 // Faster return to original position
          p.y += (p.baseY - p.y) * 0.2
          ctx.fillStyle = "white"
        }

        ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = createParticle(scale)
          if (newParticle) {
            particles[i] = newParticle
          } else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      const baseParticleCount = 8000 // Increased particle count for better density
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      )
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle(scale)
        if (newParticle) particles.push(newParticle)
      }

      animationFrameId = requestAnimationFrame(() => animate(scale))
    }

    const scale = createTextImage()
    createInitialParticles(scale)
    animate(scale)

    const handleResize = () => {
      updateCanvasSize()
      const newScale = createTextImage()
      particles = []
      createInitialParticles(newScale)
    }

    const handleMove = (x, y) => {
      mousePositionRef.current = { x, y }
    }

    const handleMouseMove = (e) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleTouchStart = () => {
      isTouchingRef.current = true
    }

    const handleTouchEnd = () => {
      isTouchingRef.current = false
      mousePositionRef.current = { x: 0, y: 0 }
    }

    const handleMouseLeave = () => {
      if (!("ontouchstart" in window)) {
        mousePositionRef.current = { x: 0, y: 0 }
      }
    }

    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black overflow-auto">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-black via-black to-[#050A15] z-0"></div>
      {/* Background dots */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-30">
        <div
          className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/3 w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/3 left-3/4 w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-2/3 left-1/5 w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-4/5 w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
      {/* Enhanced Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 sm:px-10 py-5 bg-gradient-to-b from-black/80 to-black/30 backdrop-blur-md border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo and brand */}
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
          <span className="text-white font-mono text-lg tracking-tight hidden sm:inline-block">Momentum</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
              setActiveSection("home")
            }}
            className={`text-sm font-medium relative transition-colors duration-300 ${
              activeSection === "home" ? "text-cyan-400" : "text-gray-300 hover:text-white"
            }`}
          >
            Home
            {activeSection === "home" && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>}
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              if (featuresSectionRef.current) {
                const headerHeight = 80
                const elementPosition = featuresSectionRef.current.offsetTop

                window.scrollTo({
                  top: elementPosition - headerHeight,
                  behavior: "smooth",
                })
                setActiveSection("features")
              }
            }}
            className={`text-sm font-medium relative transition-colors duration-300 ${
              activeSection === "features" ? "text-cyan-400" : "text-gray-300 hover:text-white"
            }`}
          >
            Features
            {activeSection === "features" && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>
            )}
          </a>
        </nav>

        {/* Auth buttons with improved styling */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-gray-200 hover:text-cyan-300 transition-all duration-300 text-sm font-medium relative group"
          >
            Log In
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/signup">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-md transition-all duration-300 text-sm font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
              Sign Up
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-radial from-transparent via-transparent to-black/50" />

      {/* Title above logo with static text */}
      <motion.div
        className="absolute z-20 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ top: "25%" }}
      >
        <h1 className="font-mono text-2xl sm:text-3xl md:text-4xl tracking-tight font-light">
          <span className="text-white relative">
            Experience the <span className="font-normal relative">power</span> of Momentum

          </span>
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mx-auto mt-4"></div>
      </motion.div>


      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 touch-none"
        aria-label="Interactive particle effect with Momentum logo"
      />
      
      {/* Decorative side elements */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col items-center space-y-24">
          <div className="h-40 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
          <div className="w-3 h-3 rounded-full bg-cyan-500/50 blur-sm"></div>
          <div className="h-40 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        </div>
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col items-center space-y-24">
          <div className="h-40 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
          <div className="w-3 h-3 rounded-full bg-cyan-500/50 blur-sm"></div>
          <div className="h-40 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        </div>
      </div>

      {/* Content below logo with typing animation */}
      <motion.div
        className="absolute z-20 flex flex-col items-center justify-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ top: "65%" }}
      >
        <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-center px-4 leading-relaxed font-mono">
          {displayText}
          <span
            className={`${
              showCursor ? "opacity-100" : "opacity-0"
            } transition-opacity duration-100 text-white font-bold`}
          >
            _
          </span>
        </p>

        <Link
          href="/signup"
          className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all duration-300 px-8 py-3 rounded-md font-medium flex items-center overflow-hidden shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
        >
          <span className="relative z-10 flex items-center">
            Get Started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </Link>
      </motion.div>

      {/* Feature boxes - positioned to show just the top portion */}
      <div
        ref={featuresSectionRef}
        id="features"
        className="absolute z-20 w-full max-w-7xl px-4"
        style={{ top: "98%" }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="font-mono text-gray-300 text-2xl sm:text-3xl md:text-3xl tracking-tight drop-shadow-lg mb-4">
            Why Choose Momentum
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm sm:text-base">
            Our minimalist approach helps you build lasting habits without overwhelming your daily routine.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="border border-cyan-500/20 rounded-lg p-6 bg-black/40 backdrop-blur-sm shadow-lg shadow-cyan-500/5 flex flex-col h-full transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-cyan-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 0.95 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-cyan-400"
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
            <h3 className="text-white font-mono text-lg font-medium mb-3">Daily Tracking</h3>
            <p className="text-gray-400 text-sm mb-4 flex-grow font-mono">
              Monitor your progress with simple, intuitive habit tracking that keeps you accountable. Our clean
              interface makes it easy to see your streaks and patterns at a glance.
            </p>
            <div className="mt-auto">
              <Link
                href="/signup"
                className="text-cyan-400 text-sm font-mono flex items-center hover:text-cyan-300 transition-colors duration-300"
              >
                Try now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="border border-cyan-500/20 rounded-lg p-6 bg-black/40 backdrop-blur-sm shadow-lg shadow-cyan-500/5 flex flex-col h-full transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-cyan-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 0.95 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-cyan-400"
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
            </div>
            <h3 className="text-white font-mono text-lg font-medium mb-3">Reward System</h3>
            <p className="text-gray-400 text-sm mb-4 flex-grow font-mono">
              Earn points for completed habits and redeem them for rewards that reinforce your journey. Our customizable
              reward store helps you stay motivated with meaningful incentives.
            </p>
            <div className="mt-auto">
              <Link
                href="/signup"
                className="text-cyan-400 text-sm font-mono flex items-center hover:text-cyan-300 transition-colors duration-300"
              >
                Try now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="border border-cyan-500/20 rounded-lg p-6 bg-black/40 backdrop-blur-sm shadow-lg shadow-cyan-500/5 flex flex-col h-full transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-cyan-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 0.95 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="text-white font-mono text-lg font-medium mb-3">Minimalist Design</h3>
            <p className="text-gray-400 text-sm mb-4 flex-grow font-mono">
              Focus on what matters with a clean interface that eliminates distractions. Our thoughtfully designed UI
              helps you concentrate on building habits, not managing a complex app.
            </p>
            <div className="mt-auto">
              <Link
                href="/signup"
                className="text-cyan-400 text-sm font-mono flex items-center hover:text-cyan-300 transition-colors duration-300"
              >
                Try now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="border border-cyan-500/20 rounded-lg p-6 bg-black/40 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
            <h3 className="text-white font-mono text-lg font-medium mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Progress Analytics
            </h3>
            <p className="text-gray-400 text-sm font-mono">
              Visualize your habit-building journey with intuitive charts and insights. Understand your patterns and
              optimize your routine for maximum effectiveness.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm font-mono">Weekly and monthly trend analysis</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm font-mono">Streak tracking and milestone celebrations</span>
              </li>
            </ul>
          </div>

          <div className="border border-cyan-500/20 rounded-lg p-6 bg-black/40 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
            <h3 className="text-white font-mono text-lg font-medium mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Smart Reminders
            </h3>
            <p className="text-gray-400 text-sm font-mono">
              Never miss a habit with customizable notifications that adapt to your schedule and preferences.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm font-mono">Time-based and location-based triggers</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-300 text-sm font-mono">Gentle nudges with motivational messages</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Add decorative blue line below feature boxes */}
        <motion.div
          className="mt-16 mb-24 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.9 }}
        >
          <div className="h-1 bg-gradient-to-r from-cyan-500/10 via-cyan-500 to-cyan-500/10 rounded-full w-2/3 shadow-lg shadow-cyan-500/30" />
          <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent rounded-full w-1/2 mt-2" />
          <div className="h-24 bg-black w-full"></div>
        </motion.div>
      </div>
    </div>
  )
}