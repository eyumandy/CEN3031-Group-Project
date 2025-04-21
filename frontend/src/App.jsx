javascript/**
 * 
 * @description Main application component and routing setup
 * @version 1.0
 * @dependencies 
 *  - react
 *  - next/router
 */

import { useRouter } from 'next/router';
import { HomePage, LoginPage, SignupPage } from './pages';
import { ThemeProvider } from './contexts/ThemeContext';
import React from 'react';

/**
 * Main application component with client-side routing
 * 
 * @returns {JSX.Element} The appropriate page component based on current route
 */
export default function App() {
  const router = useRouter();
  
  console.log("App rendering, router path:", router.pathname);
  
  return (
    <React.StrictMode>
      <ThemeProvider>
        {(() => {
          // Simple client-side routing based on pathname
          switch (router.pathname) {
            case '/login':
              console.log("Rendering LoginPage");
              return <LoginPage />;
            case '/signup':
              console.log("Rendering SignupPage");
              return <SignupPage />;
            default:
              console.log("Rendering HomePage");
              return <HomePage />;
          }
        })()}
      </ThemeProvider>
    </React.StrictMode>
  );
}