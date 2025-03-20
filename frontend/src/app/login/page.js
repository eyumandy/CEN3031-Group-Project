import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent server component issues
const LoginPage = dynamic(() => import('../../pages/LoginPage'), { ssr: false });

export default function Page() {
  return <LoginPage />;
}