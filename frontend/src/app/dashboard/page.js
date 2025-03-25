import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent server component issues
const DashboardPage = dynamic(() => import('../../pages/DashboardPage'), { ssr: false });

export default function Page() {
  return <DashboardPage />;
}