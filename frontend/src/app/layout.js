/**
 * 
 * @description Root layout component for Next.js App Router
 * @version 1.1
 */

import '../styles/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeApplier from '../utils/ThemeApplier';
import ThemeDebugger from '../utils/ThemeDebugger';

export const metadata = {
  title: 'Momentum - Build Lasting Habits',
  description: 'A minimalist approach to personal growth and habit tracking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* ThemeApplier ensures our theme variables are applied to DOM elements */}
          <ThemeApplier />
          
          {/* Main content */}
          {children}
          
          {/* Theme debugger helps us diagnose theme issues */}
          {process.env.NODE_ENV !== 'production' && <ThemeDebugger />}
        </ThemeProvider>
      </body>
    </html>
  )
}