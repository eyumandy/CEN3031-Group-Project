/**
 * 
 * @description Main application component and routing setup
 * @version 1.0
 * @dependencies 
 *  - react
 *  - next/router
 */

import { useRouter } from 'next/router';
import { HomePage, LoginPage, SignupPage } from './pages';

/**
 * Main application component with client-side routing
 * 
 * @returns {JSX.Element} The appropriate page component based on current route
 */
export default function App() {
  const router = useRouter();
  
  // Simple client-side routing based on pathname
  switch (router.pathname) {
    case '/login':
      return <LoginPage />;
    case '/signup':
      return <SignupPage />;
    default:
      return <HomePage />;
  }
}