/**
 * 
 * @description Root layout component for Next.js App Router
 * @version 1.0
 */

import '../styles/globals.css';

export const metadata = {
  title: 'Momentum - Build Lasting Habits',
  description: 'A minimalist approach to personal growth and habit tracking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}