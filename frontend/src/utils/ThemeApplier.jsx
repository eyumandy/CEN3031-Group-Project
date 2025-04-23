/**
 * ThemeApplier.jsx
 * 
 * A component that applies theme variables directly to HTML elements
 * Only applies themes to specific pages (shop, inventory, dashboard, achievements)
 * Comprehensive theme application for all UI elements including text, shadows, and logo effects
 * 
 * @returns {null} This component doesn't render anything visible
 */
"use client";

import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePathname } from 'next/navigation';

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
    
    // First reset any previously themed elements
    // This ensures we don't have lingering styles from previous themes
    resetElementStyling();
    
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
    
    // Calculate an alpha version of primary and secondary for overlays
    const primaryRGB = hexToRGB(theme.primary);
    const secondaryRGB = hexToRGB(theme.secondary);
    const primaryAlpha = primaryRGB ? `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0.2)` : 'rgba(0, 0, 0, 0.4)';
    const secondaryAlpha = secondaryRGB ? `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 0.1)` : 'rgba(0, 0, 0, 0.2)';
    
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
        --theme-primary-alpha: ${primaryAlpha} !important;
        --theme-secondary-alpha: ${secondaryAlpha} !important;
      }
      
      /* Background */
      body { 
        background-color: ${theme.background} !important; 
      }
      
      /* Logo glow styling based on theme */
      .logo-glow,
      .absolute.inset-0.bg-gradient-to-tr.from-cyan-500\\/20.to-transparent,
      div.w-8.h-8.relative .absolute.inset-0,
      div.w-10.h-10.relative .absolute.inset-0 {
        background-image: linear-gradient(to top right, ${theme.primary}33, transparent) !important;
        box-shadow: 0 0 15px ${theme.primary}33 !important;
      }
      
      /* Dashboard Stat Boxes - IMPORTANT FIX */
      .bg-purple-900\\/20,
      .bg-black\\/40.backdrop-blur-sm.border.border-purple-900\\/30,
      div[class*="bg-purple-900"],
      .bg-black\\/40.backdrop-blur-sm.border.border-white\\/10 {
        background-color: ${primaryAlpha} !important;
        backdrop-filter: blur(8px) !important;
        border-color: ${theme.borderColor} !important;
      }
      
      /* Dashboard Stat Box Borders */
      .border-purple-900\\/30,
      div[class*="border-purple-900"] {
        border-color: ${primaryAlpha} !important;
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
      span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500,
      /* Dashboard Today text */
      h1 span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-fuchsia-400.to-fuchsia-500 { 
        color: ${theme.primary} !important;
        -webkit-text-fill-color: ${theme.primary} !important;
      }
      
      /* Handle bg-clip-text elements specifically */
      .text-transparent.bg-clip-text.bg-gradient-to-r,
      .text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500,
      h1 span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-cyan-400.to-blue-500,
      /* Dashboard Today text gradient */
      h1 span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-fuchsia-400.to-fuchsia-500 {
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
      
      /* Complete Button styling with theme colors */
      button[data-complete="true"],
      button:contains("Complete"),
      a:contains("Complete"),
      [role="button"]:contains("Complete"),
      .complete-button,
      .btn-complete {
        background-color: ${theme.primary} !important;
        color: ${theme.textColor} !important;
        border: 1px solid ${theme.borderColor} !important;
      }
      
      /* Complete Button checkmark styling */
      button:contains("Complete") svg,
      .complete-button svg,
      .btn-complete svg,
      svg.checkmark-icon {
        color: ${theme.textColor} !important;
        fill: ${theme.textColor} !important;
        stroke: ${theme.textColor} !important;
      }
      
      /* SPECIAL CASE: Applied button styling */
      [data-applied="true"],
      button[data-applied="true"],
      button svg[data-check-icon] + span,
      svg[data-check-icon] ~ span,
      button:has(svg[data-check-icon]):not(:contains("Complete")) {
        background-color: rgba(34, 197, 94, 0.2) !important; 
        background-image: none !important;
        color: rgb(74, 222, 128) !important;
        border-color: rgba(34, 197, 94, 0.3) !important;
        cursor: default !important;
      }

      /* Make sure SVG checkmarks are green except in Complete buttons */
      svg[data-check-icon]:not(.complete-icon),
      button svg[data-check-icon]:not(.complete-icon) path {
        color: rgb(74, 222, 128) !important;
        stroke: rgb(74, 222, 128) !important;
      }
      
      /* Standard text */
      .text-white,
      .text-lg,
      .text-sm,
      .text-base,
      h1, h2, h3, h4, h5, h6,
      p, div, span:not([class*="text-gray"]):not([class*="text-cyan"]):not([class*="text-yellow"]):not([class*="text-green"]):not([class*="text-blue"]):not([class*="text-purple"]),
      button:not([data-applied="true"]):not(:has(svg[data-check-icon])) { 
        color: ${theme.textColor} !important; 
      }
      
      /* Gradient colors for backgrounds */
      .from-cyan-500,
      .from-cyan-400,
      .from-fuchsia-500,
      .from-fuchsia-400 { 
        --tw-gradient-from: ${theme.primary} !important; 
      }
      
      .to-blue-600,
      .to-blue-500,
      .to-fuchsia-400,
      .to-fuchsia-500 { 
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
      .bg-gradient-to-r.from-cyan-500.to-blue-600:not([data-applied="true"]):not(:has(svg[data-check-icon])),
      .bg-gradient-to-r.from-cyan-400.to-blue-500:not([data-applied="true"]):not(:has(svg[data-check-icon])),
      .bg-gradient-to-r.from-fuchsia-500.to-fuchsia-400:not([data-applied="true"]):not(:has(svg[data-check-icon])),
      button.bg-gradient-to-r:not([data-applied="true"]):not(:has(svg[data-check-icon])),
      a.bg-gradient-to-r:not([data-applied="true"]):not(:has(svg[data-check-icon])) {
        background-image: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
      }
      
      /* Habit completion button */
      .bg-green-600.text-white.hover\\:bg-green-500 {
        background-color: ${theme.primary} !important;
      }
      .bg-green-600.text-white.hover\\:bg-green-500:hover {
        background-color: ${theme.secondary} !important;
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
      
      .hover\\:from-cyan-400:hover,
      .hover\\:from-fuchsia-400:hover {
        --tw-gradient-from: ${theme.primary} !important;
      }
      
      .hover\\:to-blue-500:hover,
      .hover\\:to-fuchsia-300:hover {
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
      
      /* Dashboard filter buttons - active state */
      button.px-4.py-2.rounded-md.text-sm.font-mono.transition-all.duration-300.bg-gradient-to-r.from-fuchsia-500.to-fuchsia-400.text-white {
        background-image: linear-gradient(to right, ${theme.primary}, ${theme.secondary}) !important;
      }
      
      /* Dashboard filter buttons - inactive state */
      button.px-4.py-2.rounded-md.text-sm.font-mono.transition-all.duration-300.bg-black\\/40.border.border-purple-900\\/60 {
        border-color: ${theme.borderColor} !important;
        background-color: ${theme.cardBg} !important;
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
      // Apply theme to logo glow
      document.querySelectorAll('.absolute.inset-0.bg-gradient-to-tr.from-cyan-500\\/20.to-transparent').forEach(el => {
        el.style.backgroundImage = `linear-gradient(to top right, ${theme.primary}33, transparent)`;
        el.style.boxShadow = `0 0 15px ${theme.primary}33`;
      });
      
      // Find all logo SVGs and apply theme styling
      document.querySelectorAll('svg[viewBox="0 0 1380 1090"]').forEach(svgEl => {
        // Change the SVG fill color to match the theme
        svgEl.style.fill = theme.textColor;
        
        // Find the parent container to apply the glow
        const container = svgEl.closest('.w-8.h-8.relative, .w-10.h-10.relative');
        if (container) {
          const glowEl = container.querySelector('.absolute.inset-0');
          if (glowEl) {
            glowEl.style.backgroundImage = `linear-gradient(to top right, ${theme.primary}33, transparent)`;
            glowEl.style.boxShadow = `0 0 15px ${theme.primary}33`;
          }
        }
      });
      
      // Dashboard stat boxes
      document.querySelectorAll('.bg-purple-900\\/20, .bg-black\\/40.backdrop-blur-sm.border.border-purple-900\\/30').forEach(el => {
        el.style.backgroundColor = primaryAlpha;
        el.style.backdropFilter = 'blur(8px)';
        el.style.borderColor = `${theme.borderColor}`;
      });
      
      // Title gradient backgrounds 
      document.querySelectorAll('.text-transparent.bg-clip-text.bg-gradient-to-r, h1 span.ml-2.text-transparent, h1 span.ml-2.text-transparent.bg-clip-text.bg-gradient-to-r.from-fuchsia-400.to-fuchsia-500').forEach(el => {
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
      
      // Active filter buttons in dashboard
      document.querySelectorAll('button.px-4.py-2.rounded-md.text-sm.font-mono.transition-all.duration-300.bg-gradient-to-r.from-fuchsia-500.to-fuchsia-400.text-white').forEach(el => {
        el.style.backgroundImage = `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`;
      });
      
      // Inactive filter buttons in dashboard
      document.querySelectorAll('button.px-4.py-2.rounded-md.text-sm.font-mono.transition-all.duration-300.bg-black\\/40.border.border-purple-900\\/60').forEach(el => {
        el.style.borderColor = theme.borderColor;
        el.style.backgroundColor = theme.cardBg;
      });
      
      // Gradient buttons
      document.querySelectorAll('button.bg-gradient-to-r:not([data-applied="true"]), a.bg-gradient-to-r:not([data-applied="true"])').forEach(el => {
        // Skip if this has a check icon SVG
        if (!el.querySelector('svg[data-check-icon]')) {
          el.style.backgroundImage = `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`;
        }
      });
      
      // Card backgrounds
      document.querySelectorAll('.bg-black\\/40, div[class*="bg-black"]').forEach(el => {
        el.style.backgroundColor = theme.cardBg;
      });
      
      // Handle "Complete" button styling with theme colors
      document.querySelectorAll('button, a, [role="button"]').forEach(el => {
        const buttonText = el.textContent?.trim();
        
        if (buttonText === "Complete") {
          // Mark this as a complete button
          el.setAttribute('data-complete', 'true');
          el.classList.add('complete-button');
          
          // Apply theme color styling
          el.style.backgroundColor = theme.primary;
          el.style.color = theme.textColor;
          el.style.border = `1px solid ${theme.borderColor}`;
          
          // Find and style any checkmark SVGs inside
          const svgs = el.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.classList.add('complete-icon');
            svg.style.color = theme.textColor;
            svg.style.fill = theme.textColor;
            
            // Style all paths in the SVG
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              path.style.stroke = theme.textColor;
              path.style.fill = theme.textColor;
            });
          });
        }
      });
      
      // *** IMPORTANT FIX: Handle "Apply Theme" button and logo SVG ***
      const applyThemeButtons = document.querySelectorAll('button, .button, [role="button"]');
      applyThemeButtons.forEach(button => {
        // Check for Apply Theme text content
        const buttonText = button.textContent?.trim();
        if (buttonText === "Apply Theme") {
          // Get all SVGs within this button
          const svgs = button.querySelectorAll('svg');
          svgs.forEach(svg => {
            // Don't modify the SVG directly, only style the paths inside
            svg.style.fill = ""; // Clear any fill that might be set on the SVG itself
            svg.style.color = theme.textColor;
            
            // Apply styles to individual paths more carefully
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              // Check if this is a filled or outline path
              const currentFill = path.getAttribute('fill');
              const currentStroke = path.getAttribute('stroke');
              
              // If it's meant to be filled, apply the text color as fill
              if (currentFill && currentFill !== 'none') {
                path.style.fill = theme.textColor;
              } else {
                // Clear any fill that might have been set
                path.style.fill = "";
              }
              
              // If it's meant to have a stroke, apply the text color as stroke
              if (currentStroke && currentStroke !== 'none') {
                path.style.stroke = theme.textColor;
                // Preserve stroke width
                const strokeWidth = path.getAttribute('stroke-width');
                if (strokeWidth) {
                  path.style.strokeWidth = strokeWidth;
                }
              } else {
                // Clear any stroke that might have been set
                path.style.stroke = "";
              }
            });
          });
        }
      });
      
      // Identify all SVGs near "Apply Theme" text
      const allNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let currentNode;
      while (currentNode = allNodes.nextNode()) {
        if (currentNode.textContent?.includes('Apply Theme')) {
          // Found text node containing "Apply Theme"
          const parentEl = currentNode.parentElement;
          if (parentEl) {
            // Check nearby elements for SVGs (siblings, parent siblings, etc.)
            const nearbyContainer = parentEl.closest('.button, button, [role="button"], .flex, .inline-flex, .inline-block');
            if (nearbyContainer) {
              const nearbySvgs = nearbyContainer.querySelectorAll('svg');
              nearbySvgs.forEach(svg => {
                // Don't modify the SVG directly, only style the paths inside
                svg.style.fill = ""; // Clear any fill that might be set on the SVG itself
                svg.style.color = theme.textColor;
                
                // Apply styles to individual paths more carefully
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                  // Check if this is a filled or outline path
                  const currentFill = path.getAttribute('fill');
                  const currentStroke = path.getAttribute('stroke');
                  
                  // If it's meant to be filled, apply the text color as fill
                  if (currentFill && currentFill !== 'none') {
                    path.style.fill = theme.textColor;
                  } else {
                    // Clear any fill that might have been set
                    path.style.fill = "";
                  }
                  
                  // If it's meant to have a stroke, apply the text color as stroke
                  if (currentStroke && currentStroke !== 'none') {
                    path.style.stroke = theme.textColor;
                    // Preserve stroke width
                    const strokeWidth = path.getAttribute('stroke-width');
                    if (strokeWidth) {
                      path.style.strokeWidth = strokeWidth;
                    }
                  } else {
                    // Clear any stroke that might have been set
                    path.style.stroke = "";
                  }
                });
              });
            }
          }
        }
      }
      
      // Handle specific SVG logos that might need theme colors
      document.querySelectorAll('.theme-icon, .themed-icon, .theme-logo, .themed-logo').forEach(el => {
        el.style.color = theme.primary;
        el.style.fill = theme.primary;
        
        // Apply to all child SVGs
        const svgs = el.querySelectorAll('svg');
        svgs.forEach(svg => {
          svg.style.fill = theme.primary;
          svg.style.color = theme.primary;
          
          // Apply to all paths
          const paths = svg.querySelectorAll('path');
          paths.forEach(path => {
            path.style.fill = theme.primary;
            path.style.stroke = theme.primary;
          });
        });
      });
      
      // Applied button styling - but make sure we exclude Complete buttons
      document.querySelectorAll('button').forEach(el => {
        // Skip Complete buttons
        if (el.textContent?.trim() === "Complete" || el.classList.contains('complete-button') || el.getAttribute('data-complete') === 'true') {
          return;
        }
        
        // Handle Applied buttons specifically
        const textContent = el.textContent?.trim();
        if (textContent === "Applied") {
          el.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
          el.style.backgroundImage = "none";
          el.style.color = "rgb(74, 222, 128)";
          el.style.borderColor = "rgba(34, 197, 94, 0.3)";
          
          // Add a data attribute to help with CSS targeting
          el.setAttribute('data-applied', 'true');
          
          // Reset any SVG colors within Applied buttons to green
          const svgs = el.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.style.fill = "rgb(74, 222, 128)";
            svg.style.color = "rgb(74, 222, 128)";
            
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              path.style.fill = "rgb(74, 222, 128)";
              path.style.stroke = "rgb(74, 222, 128)";
            });
          });
        }
      });
      
      // Find buttons with checkmark SVGs and style them as Applied - but exclude Complete buttons
      document.querySelectorAll('button svg').forEach(svg => {
        // Skip if in a Complete button
        const button = svg.closest('button');
        if (button && (button.textContent?.trim() === "Complete" || button.getAttribute('data-complete') === 'true' || button.classList.contains('complete-button'))) {
          return;
        }
        
        const parent = svg.parentElement;
        const pathElements = svg.querySelectorAll('path');
        
        // Check if this SVG contains a checkmark path
        pathElements.forEach(path => {
          const d = path.getAttribute('d');
          
          // Common checkmark path characteristics
          if (d && (
              d.includes('5 13l4 4L19 7') || // Typical checkmark path
              d.includes('M5 13l4 4L19 7') || 
              d.includes('check')
          )) {
            // This is likely a checkmark SVG - but not inside a Complete button
            svg.setAttribute('data-check-icon', 'true');
            path.style.stroke = "rgb(74, 222, 128)";
            
            // Style the button
            if (parent && parent.tagName === 'BUTTON') {
              parent.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
              parent.style.backgroundImage = "none";
              parent.style.color = "rgb(74, 222, 128)";
              parent.style.borderColor = "rgba(34, 197, 94, 0.3)";
              parent.setAttribute('data-applied', 'true');
            }
          }
        });
      });
      
    } catch (err) {
      console.error('Error applying direct styles:', err);
    }
    
    // Store the theme name in localStorage
    localStorage.setItem('momentum-theme', themeName);
    
    // Set up a handler to ensure theme styles are applied to dynamically added elements
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          // Look for new Complete buttons and mark them with theme colors
          document.querySelectorAll('button, a, [role="button"]').forEach(el => {
            const buttonText = el.textContent?.trim();
            
            if (buttonText === "Complete" && !el.classList.contains('complete-button') && el.getAttribute('data-complete') !== 'true') {
              // Mark as a complete button
              el.setAttribute('data-complete', 'true');
              el.classList.add('complete-button');
              
              // Apply theme color styling
              el.style.backgroundColor = theme.primary;
              el.style.color = theme.textColor;
              el.style.border = `1px solid ${theme.borderColor}`;
              
              // Find and style any checkmark SVGs inside
              const svgs = el.querySelectorAll('svg');
              svgs.forEach(svg => {
                svg.classList.add('complete-icon');
                svg.style.color = theme.textColor;
                svg.style.fill = theme.textColor;
                
                // Style all paths in the SVG
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                  path.style.stroke = theme.textColor;
                  path.style.fill = theme.textColor;
                });
              });
            }
          });
        
          // Look for new Applied buttons - but skip Complete buttons
          document.querySelectorAll('button').forEach(el => {
            // Skip Complete buttons
            if (el.textContent?.trim() === "Complete" || el.classList.contains('complete-button') || el.getAttribute('data-complete') === 'true') {
              return;
            }
            
            const textContent = el.textContent?.trim();
            if (textContent === "Applied") {
              el.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
              el.style.backgroundImage = "none";
              el.style.color = "rgb(74, 222, 128)";
              el.style.borderColor = "rgba(34, 197, 94, 0.3)";
              el.setAttribute('data-applied', 'true');
              
              // Reset any SVG colors within Applied buttons to green
              const svgs = el.querySelectorAll('svg');
              svgs.forEach(svg => {
                svg.style.fill = "rgb(74, 222, 128)";
                svg.style.color = "rgb(74, 222, 128)";
                
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                  path.style.fill = "rgb(74, 222, 128)";
                  path.style.stroke = "rgb(74, 222, 128)";
                });
              });
            }
          });
          
          // Find buttons with checkmark SVGs - but skip those in Complete buttons
          document.querySelectorAll('button svg').forEach(svg => {
            // Skip if in a Complete button
            const button = svg.closest('button');
            if (button && (button.textContent?.trim() === "Complete" || button.getAttribute('data-complete') === 'true' || button.classList.contains('complete-button'))) {
              return;
            }
            
            const parent = svg.parentElement;
            const pathElements = svg.querySelectorAll('path');
            
            pathElements.forEach(path => {
              const d = path.getAttribute('d');
              
              if (d && (
                  d.includes('5 13l4 4L19 7') || // Typical checkmark path
                  d.includes('M5 13l4 4L19 7') || 
                  d.includes('check')
              )) {
                // This is likely a checkmark SVG
                svg.setAttribute('data-check-icon', 'true');
                path.style.stroke = "rgb(74, 222, 128)";
                
                // Style the button
                if (parent && parent.tagName === 'BUTTON') {
                  parent.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
                  parent.style.backgroundImage = "none";
                  parent.style.color = "rgb(74, 222, 128)";
                  parent.style.borderColor = "rgba(34, 197, 94, 0.3)";
                  parent.setAttribute('data-applied', 'true');
                }
              }
            });
          });
          
          // Apply theme to new logo glows that might have been added
          document.querySelectorAll('.absolute.inset-0.bg-gradient-to-tr.from-cyan-500\\/20.to-transparent').forEach(el => {
            el.style.backgroundImage = `linear-gradient(to top right, ${theme.primary}33, transparent)`;
            el.style.boxShadow = `0 0 15px ${theme.primary}33`;
          });
          
          // Check for new "Apply Theme" related elements
          const applyThemeButtons = document.querySelectorAll('button, .button, [role="button"]');
          applyThemeButtons.forEach(button => {
            // Check for Apply Theme text content
            const buttonText = button.textContent?.trim();
            if (buttonText === "Apply Theme") {
              // Get all SVGs within this button
              const svgs = button.querySelectorAll('svg');
              svgs.forEach(svg => {
                // Don't modify the SVG directly, only style the paths inside
                svg.style.fill = ""; // Clear any fill that might be set on the SVG itself
                svg.style.color = theme.textColor;
                
                // Apply styles to individual paths more carefully
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                  // Check if this is a filled or outline path
                  const currentFill = path.getAttribute('fill');
                  const currentStroke = path.getAttribute('stroke');
                  
                  // If it's meant to be filled, apply the text color as fill
                  if (currentFill && currentFill !== 'none') {
                    path.style.fill = theme.textColor;
                  } else {
                    // Clear any fill that might have been set
                    path.style.fill = "";
                  }
                  
                  // If it's meant to have a stroke, apply the text color as stroke
                  if (currentStroke && currentStroke !== 'none') {
                    path.style.stroke = theme.textColor;
                    // Preserve stroke width
                    const strokeWidth = path.getAttribute('stroke-width');
                    if (strokeWidth) {
                      path.style.strokeWidth = strokeWidth;
                    }
                  } else {
                    // Clear any stroke that might have been set
                    path.style.stroke = "";
                  }
                });
              });
            }
          });
          
          // Check for new SVG logos and apply theme
          document.querySelectorAll('svg[viewBox="0 0 1380 1090"]').forEach(svgEl => {
            // Change the SVG fill color to match the theme
            svgEl.style.fill = theme.textColor;
            
            // Find the parent container to apply the glow
            const container = svgEl.closest('.w-8.h-8.relative, .w-10.h-10.relative');
            if (container) {
              const glowEl = container.querySelector('.absolute.inset-0');
              if (glowEl) {
                glowEl.style.backgroundImage = `linear-gradient(to top right, ${theme.primary}33, transparent)`;
                glowEl.style.boxShadow = `0 0 15px ${theme.primary}33`;
              }
            }
          });
          
          // Also update dashboard stat boxes if new ones are added
          document.querySelectorAll('.bg-purple-900\\/20, .bg-black\\/40.backdrop-blur-sm.border.border-purple-900\\/30').forEach(el => {
            el.style.backgroundColor = primaryAlpha;
            el.style.backdropFilter = 'blur(8px)';
            el.style.borderColor = `${theme.borderColor}`;
          });
        }
      });
    });
    
    // Start observing the document for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Store the observer to clean it up later
    window._themeObserver = observer;
  };
  
  // Function to reset styling on elements before applying new theme
  const resetElementStyling = () => {
    try {
      // Reset button data attributes for Applied status
      document.querySelectorAll('[data-applied="true"]').forEach(el => {
        el.removeAttribute('data-applied');
      });
      
      // Reset SVG checkmarks
      document.querySelectorAll('svg[data-check-icon]').forEach(svg => {
        svg.removeAttribute('data-check-icon');
      });
      
      // Reset Complete button data attributes
      document.querySelectorAll('[data-complete="true"]').forEach(el => {
        el.removeAttribute('data-complete');
      });
      
      // Reset Apply Theme button SVGs to preserve original appearance with default text color
      document.querySelectorAll('button, .button, [role="button"]').forEach(button => {
        const buttonText = button.textContent?.trim();
        if (buttonText === "Apply Theme") {
          const svgs = button.querySelectorAll('svg');
          svgs.forEach(svg => {
            // Clear fill on SVG itself
            svg.style.fill = "";
            svg.style.color = "";
            
            // Reset individual paths more carefully
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              // Check original attributes to determine styling
              const defaultFill = path.getAttribute('fill');
              const defaultStroke = path.getAttribute('stroke');
              
              // Apply default styling while preserving the logo structure
              if (defaultFill && defaultFill !== 'none') {
                path.style.fill = "";
              } else {
                path.style.fill = "";
              }
              
              if (defaultStroke && defaultStroke !== 'none') {
                path.style.stroke = "";
                // Preserve stroke width
                const strokeWidth = path.getAttribute('stroke-width');
                if (strokeWidth) {
                  path.style.strokeWidth = strokeWidth;
                }
              } else {
                path.style.stroke = "";
              }
            });
          });
        }
      });
      
      // Remove any inline styles from buttons that might interfere with theming
      document.querySelectorAll('button').forEach(button => {
        const textContent = button.textContent?.trim();
        
        // Keep the actual Applied button's styling
        if (textContent === "Applied") {
          button.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
          button.style.backgroundImage = "none";
          button.style.color = "rgb(74, 222, 128)";
          button.style.borderColor = "rgba(34, 197, 94, 0.3)";
          button.setAttribute('data-applied', 'true');
          
          // Keep SVGs green
          const svgs = button.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.style.fill = "rgb(74, 222, 128)";
            svg.style.color = "rgb(74, 222, 128)";
            
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              path.style.fill = "rgb(74, 222, 128)";
              path.style.stroke = "rgb(74, 222, 128)";
            });
          });
        } 
        else {
          // Reset other buttons
          button.style.backgroundColor = "";
          button.style.backgroundImage = "";
          button.style.color = "";
          button.style.borderColor = "";
          button.style.boxShadow = "";
          button.style.fontWeight = "";
        }
      });
    } catch (err) {
      console.error('Error resetting element styling:', err);
    }
  };
  
  // Function to reset to default theme
  const resetToDefaultTheme = () => {
    // Reset element styling first
    resetElementStyling();
    
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
      
      // Reset logo glow to default
      document.querySelectorAll('.absolute.inset-0.bg-gradient-to-tr.from-cyan-500\\/20.to-transparent').forEach(el => {
        el.style.backgroundImage = 'linear-gradient(to top right, rgba(0, 220, 255, 0.2), transparent)';
        el.style.boxShadow = 'none';
      });
      
      // Reset SVG logo fill
      document.querySelectorAll('svg[viewBox="0 0 1380 1090"]').forEach(svgEl => {
        svgEl.style.fill = '#FFFFFF';
      });
      
      // Reset Complete buttons to default theme
      document.querySelectorAll('.complete-button, button[data-complete="true"], button, a, [role="button"]').forEach(el => {
        const buttonText = el.textContent?.trim();
        if (buttonText === "Complete" || el.classList.contains('complete-button') || el.getAttribute('data-complete') === 'true') {
          // Use default theme colors for Complete buttons
          el.style.backgroundColor = defaultTheme.primary;
          el.style.color = defaultTheme.textColor;
          el.style.border = `1px solid ${defaultTheme.borderColor}`;
          
          if (!el.classList.contains('complete-button')) {
            el.classList.add('complete-button');
          }
          
          // Reset checkmark SVGs inside Complete buttons
          const svgs = el.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.classList.add('complete-icon');
            svg.style.color = defaultTheme.textColor;
            svg.style.fill = defaultTheme.textColor;
            
            // Style all paths in the SVG
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              path.style.stroke = defaultTheme.textColor;
              path.style.fill = defaultTheme.textColor;
            });
          });
        }
      });
    }
  };
  
  // Helper function to convert hex to RGB
  const hexToRGB = (hex) => {
    if (!hex) return null;
    
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };
  
  return null; // This component doesn't render anything visible
}