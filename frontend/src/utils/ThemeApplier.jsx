"use client";

import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePathname } from 'next/navigation';

/**
 * ThemeApplier.jsx
 * 
 * A component that applies theme variables directly to HTML elements
 * Only applies themes to specific pages (shop, inventory, dashboard, achievements)
 * Comprehensive theme application for all UI elements including text, shadows, and subtle effects
 * 
 * @returns {null} This component doesn't render anything visible
 */
export default function ThemeApplier() {
  const { currentTheme, themes, isInitialized } = useTheme();
  const pathname = usePathname();
  const lastAppliedThemeRef = useRef('');
  
  // Define which pages should have themes applied
  const themedPages = ['/shop', '/inventory', '/dashboard', '/achievements'];
  const shouldApplyTheme = themedPages.some(page => pathname?.includes(page));
  
  // Single effect to handle all theme application logic
  useEffect(() => {
    // Wait for initialization
    if (!isInitialized) return;
    
    // Check if we're on a themed page
    if (!shouldApplyTheme) {
      // If we're not on a themed page and had previously applied a theme,
      // reset to default theme
      if (lastAppliedThemeRef.current) {
        console.log(`ThemeApplier: Resetting theme as we're not on a themed page: ${pathname}`);
        resetToDefaultTheme();
        lastAppliedThemeRef.current = '';
      }
      return;
    }
    
    // Skip if theme hasn't changed
    if (currentTheme === lastAppliedThemeRef.current) return;
    
    // Apply theme since we're on a themed page and the theme has changed
    console.log(`ThemeApplier: Applying theme ${currentTheme} to ${pathname}`);
    applyTheme(currentTheme);
    lastAppliedThemeRef.current = currentTheme;
    
    // Cleanup on unmount
    return () => {
      // Only reset if we're leaving a themed page
      if (shouldApplyTheme) {
        resetToDefaultTheme();
        lastAppliedThemeRef.current = '';
      }
    };
  }, [currentTheme, pathname, isInitialized, shouldApplyTheme]);
  
  // Function to apply a theme - doesn't use state to avoid re-renders
  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    
    // Apply theme-specific class to body
    document.body.classList.add('theme-transition');
    document.body.setAttribute('data-theme', themeName);
    
    // Create or update the style element
    const styleId = 'theme-override-style';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      // Add high priority so styles take precedence
      styleEl.setAttribute('data-priority', 'high');
      document.head.appendChild(styleEl);
    }
    
    // Set style content all at once to minimize repaints
    styleEl.textContent = `
      /* Theme: ${themeName} applied at ${new Date().toISOString()} */
      :root {
        --theme-primary: ${theme.primary} !important;
        --theme-secondary: ${theme.secondary} !important;
        --theme-accent: ${theme.accent} !important;
        --theme-background: ${theme.background} !important;
        --theme-cardBg: ${theme.cardBg} !important;
        --theme-borderColor: ${theme.borderColor} !important;
        --theme-textColor: ${theme.textColor} !important;
        --theme-textMuted: ${theme.textMuted} !important;
      }
      
      /* Background */
      body { 
        background-color: ${theme.background} !important; 
      }
      
      /* Basic text colors - apply to ALL text elements */
      .text-cyan-400, 
      [class*="text-cyan-"],
      .text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400,
      .text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500,
      h1 .text-transparent.bg-clip-text.bg-gradient-to-r,
      h1 span.text-transparent,
      h1 span.ml-2.text-transparent,
      h1 span[class*="text-transparent"],
      span.ml-2.text-transparent.bg-clip-text,
      span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500 { 
        color: ${theme.primary} !important;
        -webkit-text-fill-color: ${theme.primary} !important;
      }
      
      /* Handle bg-clip-text elements specifically */
      .text-transparent.bg-clip-text.bg-gradient-to-r,
      .text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500,
      h1 span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500 {
        background-image: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
        -webkit-background-clip: text !important;
        color: transparent !important;
      }
      
      /* Muted text colors */
      .text-gray-300, 
      .text-gray-400,
      .text-gray-500,
      p.text-gray-400,
      p.text-gray-500,
      span.text-gray-400,
      div.text-gray-400 { 
        color: ${theme.textMuted} !important; 
      }
      
      /* Standard text */
      .text-white,
      .text-lg,
      .text-sm,
      .text-base,
      h1, h2, h3, h4, h5, h6,
      p, div, span:not([class*="text-gray"]):not([class*="text-cyan"]):not([class*="text-yellow"]):not([class*="text-green"]),
      button:not([class*="from-cyan"]) { 
        color: ${theme.textColor} !important; 
      }
      
      /* Gradient colors for backgrounds */
      .from-cyan-500,
      .from-cyan-400 { 
        --tw-gradient-from: ${theme.primary} !important; 
      }
      
      .to-blue-600,
      .to-blue-500 { 
        --tw-gradient-to: ${theme.secondary} !important; 
      }
      
      /* Box backgrounds */
      .bg-black\\/40,
      .bg-black\\/80,
      div[class*="bg-black"] { 
        background-color: ${theme.cardBg} !important; 
      }
      
      /* Border colors */
      .border-white\\/10,
      .border-white\\/5,
      div[class*="border-white"] { 
        border-color: ${theme.borderColor} !important; 
      }
      
      /* Button gradients - except for "Applied" button */
      .bg-gradient-to-r.from-cyan-500.to-blue-600:not(.bg-green-500\\/20):not([class*="Applied"]),
      .bg-gradient-to-r.from-cyan-400.to-blue-500:not(.bg-green-500\\/20):not([class*="Applied"]),
      button.bg-gradient-to-r:not(.bg-green-500\\/20):not([class*="Applied"]),
      a.bg-gradient-to-r:not(.bg-green-500\\/20):not([class*="Applied"]) {
        background-image: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
      }
      
      /* Shadow effects */
      .shadow-cyan-500\\/20,
      .shadow-cyan-500\\/40,
      .hover\\:shadow-cyan-500\\/40,
      [class*="shadow-cyan"] {
        --tw-shadow-color: ${theme.primary}33 !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      /* Hover states */
      .hover\\:text-cyan-300:hover,
      .hover\\:text-cyan-400:hover {
        color: ${theme.primary} !important;
      }
      
      .hover\\:from-cyan-400:hover {
        --tw-gradient-from: ${theme.primary} !important;
      }
      
      .hover\\:to-blue-500:hover {
        --tw-gradient-to: ${theme.secondary} !important;
      }
      
      /* Navigation specific */
      a.text-cyan-400,
      a span.text-cyan-400,
      a.text-sm.font-medium.relative.text-cyan-400 {
        color: ${theme.primary} !important;
      }
      
      /* Absolute positioned cyan element (underline in nav) */
      .absolute.-bottom-1.left-0.w-full.h-0\\.5.bg-cyan-400,
      span.absolute.-bottom-1.left-0.w-full.h-0\\.5 {
        background-color: ${theme.primary} !important;
      }
      
      /* Focus rings */
      .focus\\:ring-cyan-500\\/50:focus,
      .focus\\:border-cyan-500:focus {
        --tw-ring-color: ${theme.primary}80 !important;
        border-color: ${theme.primary} !important;
      }
      
      /* SPECIAL CASE: Always make "Applied" button green */
      .bg-green-500\\/20,
      button.bg-green-500\\/20,
      [class*="Applied"],
      button:contains("Applied") {
        background-color: rgba(34, 197, 94, 0.2) !important; 
        background-image: none !important;
        color: rgb(74, 222, 128) !important;
        cursor: default !important;
      }
      
      /* Force hardware acceleration for smoother transitions */
      .theme-transition * {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
      }
    `;
    
    // Apply direct styles to specific elements that might be hard to target with CSS
    try {
      // Title gradient backgrounds 
      document.querySelectorAll('.text-transparent.bg-clip-text.bg-gradient-to-r, h1 span.ml-2.text-transparent').forEach(el => {
        el.style.backgroundImage = `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`;
        el.style.webkitBackgroundClip = 'text';
        el.style.backgroundClip = 'text';
        el.style.color = 'transparent';
      });
      
      // Navigation item with underline
      document.querySelectorAll('a.text-cyan-400, nav a.text-sm.font-medium.relative.text-cyan-400').forEach(el => {
        el.style.color = theme.primary;
        // Find the underline element
        const underline = el.querySelector('span.absolute.-bottom-1');
        if (underline) {
          underline.style.backgroundColor = theme.primary;
        }
      });
      
      // Gradient buttons - exclude Applied button
      document.querySelectorAll('button.bg-gradient-to-r:not(.bg-green-500\\/20), a.bg-gradient-to-r:not(.bg-green-500\\/20)').forEach(el => {
        // Skip if this is the "Applied" button
        if (el.textContent && el.textContent.trim() === "Applied") {
          el.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
          el.style.backgroundImage = "none";
          el.style.color = "rgb(74, 222, 128)";
          return;
        }
        
        el.style.backgroundImage = `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`;
      });
      
      // Card backgrounds
      document.querySelectorAll('.bg-black\\/40, div[class*="bg-black"]').forEach(el => {
        el.style.backgroundColor = theme.cardBg;
      });
      
      // Specifically target all "Applied" buttons to make them green
      document.querySelectorAll('button').forEach(el => {
        if (el.textContent && el.textContent.trim() === "Applied") {
          el.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
          el.style.backgroundImage = "none";
          el.style.color = "rgb(74, 222, 128)";
        }
      });
      
      // Also find and style any elements that might be the "Applied" button by class names
      document.querySelectorAll('.bg-green-500\\/20, [class*="Applied"]').forEach(el => {
        el.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
        el.style.backgroundImage = "none";
        el.style.color = "rgb(74, 222, 128)";
      });
      
      // Update box shadows
      document.querySelectorAll('[class*="shadow-cyan"]').forEach(el => {
        // Extract existing shadow properties
        const computedStyle = window.getComputedStyle(el);
        const shadowValue = computedStyle.boxShadow;
        
        // Apply new color but keep shadow dimensions
        if (shadowValue && shadowValue !== 'none') {
          // Extract shadow dimensions (assumes format: 0px 0px 0px rgba(0,0,0,0))
          const shadowParts = shadowValue.match(/(\d+px \d+px \d+px)/g);
          
          if (shadowParts && shadowParts.length > 0) {
            const shadowDimensions = shadowParts[0];
            // Create new shadow with theme color
            el.style.boxShadow = `${shadowDimensions} ${theme.primary}33`;
          }
        }
      });
    } catch (err) {
      console.error('Error applying direct styles:', err);
    }
    
    // Store the theme name in localStorage
    localStorage.setItem('momentum-theme', themeName);
    
    // Set up a handler to ensure Applied buttons stay green if DOM changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          // Check for new "Applied" buttons and make them green
          document.querySelectorAll('button').forEach(el => {
            if (el.textContent && el.textContent.trim() === "Applied") {
              el.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
              el.style.backgroundImage = "none";
              el.style.color = "rgb(74, 222, 128)";
            }
          });
        }
      });
    });
    
    // Start observing the document for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Store the observer to clean it up later
    window._themeObserver = observer;
  };
  
  // Function to reset to default theme
  const resetToDefaultTheme = () => {
    // Remove data-theme attribute
    document.body.removeAttribute('data-theme');
    document.body.classList.remove('theme-transition');
    
    // Clean up mutation observer if it exists
    if (window._themeObserver) {
      window._themeObserver.disconnect();
      window._themeObserver = null;
    }
    
    // Clear the style element
    const styleEl = document.getElementById('theme-override-style');
    if (styleEl) {
      styleEl.textContent = '';
    }
    
    // Reset CSS variables to defaults
    const defaultTheme = themes.basic;
    if (defaultTheme) {
      const root = document.documentElement;
      Object.entries(defaultTheme).forEach(([property, value]) => {
        root.style.setProperty(`--theme-${property}`, value);
      });
    }
  };
  
  return null; // This component doesn't render anything visible
}