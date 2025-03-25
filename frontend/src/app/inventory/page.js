/**
 * 
 * Main page component for the inventory route
 * Uses dynamic import to prevent server component issues
 */

import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent server component issues
const InventoryPage = dynamic(() => import('../../pages/InventoryPage'), { ssr: false });

export default function Page() {
  return <InventoryPage />;
}