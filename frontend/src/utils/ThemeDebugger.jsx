"use client";

import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';


const ThemeDebugger = () => {
  const { currentTheme, themes, isInitialized } = useTheme();
  const [cssVariables, setCssVariables] = useState({});
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      const variables = {};
      
      // Get all theme CSS variables
      ['primary', 'secondary', 'accent', 'background', 'cardBg', 'borderColor', 'textColor', 'textMuted'].forEach(prop => {
        variables[prop] = style.getPropertyValue(`--theme-${prop}`).trim();
      });
      
      setCssVariables(variables);
    }
  }, [currentTheme]);
  
  if (!isInitialized) {
    return <div className="theme-debug">Theme context not initialized yet</div>;
  }
  
  return (
    <div className="fixed bottom-3 left-3 z-50">
      {visible ? (
        <div className="bg-black/80 border border-white/30 rounded-lg p-3 text-white text-xs font-mono max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Theme Debugger</h3>
            <button 
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              × Hide
            </button>
          </div>
          
          <div className="mb-2">
            <div>Current theme: <span className="text-cyan-400">{currentTheme}</span></div>
            <div>Initialized: <span className="text-green-400">Yes</span></div>
          </div>
          
          <div className="mb-2">
            <div className="font-medium mb-1">CSS Variables:</div>
            <div className="space-y-1 pl-2">
              {Object.entries(cssVariables).map(([prop, value]) => (
                <div key={prop} className="flex items-center">
                  <div className="w-24 text-gray-400">--theme-{prop}:</div>
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 inline-block rounded-full" 
                      style={{ backgroundColor: value }}
                    ></div>
                    <code>{value}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-400 italic">
            Add to any page for theme debugging
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setVisible(true)}
          className="bg-black/80 border border-white/30 rounded-lg px-2 py-1 text-white text-xs"
        >
          Show Theme Debug
        </button>
      )}
    </div>
  );
};

export default ThemeDebugger;