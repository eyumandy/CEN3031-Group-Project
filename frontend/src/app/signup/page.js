import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent server component issues
const SignupPage = dynamic(() => import('../../pages/SignupPage'), { ssr: false });

export default function Page() {
  return <SignupPage />;
}