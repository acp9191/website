// components/ClientLayout.tsx
'use client';

import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">{children}</main>
      <footer className="py-3">
        <Footer />
      </footer>
    </div>
  );
}
