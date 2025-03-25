/**
 * 
 * Main page component for the shop route
 * Uses dynamic import to prevent server component issues
 */

import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent server component issues
const ShopPage = dynamic(() => import('../../pages/ShopPage'), { ssr: false });

export default function Page() {
  return <ShopPage />;
}