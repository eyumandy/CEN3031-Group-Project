/**
 * 
 * Main page component for the achievements route
 * Uses dynamic import to prevent server component issues
 */

import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent server component issues
const AchievementsPage = dynamic(() => import('../../pages/AchievementsPage'), { ssr: false });

export default function Page() {
  return <AchievementsPage />;
}