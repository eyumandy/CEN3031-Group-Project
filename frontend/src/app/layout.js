import '../styles/globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
export const metadata = {
  title: 'Momentum - Build Lasting Habits',
  description: 'A minimalist approach to personal growth and habit tracking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}