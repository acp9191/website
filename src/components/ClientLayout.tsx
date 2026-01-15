'use client';

import Header from './Header';
import Footer from './Footer';
import { PrivyProvider } from '@privy-io/react-auth';
import { base, polygon, arbitrum, mainnet, sepolia } from 'viem/chains';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        defaultChain: base,
        supportedChains: [base, polygon, arbitrum, mainnet, sepolia],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header />
        <main className="flex-1 px-4 py-8" role="main">{children}</main>
        <Footer />
      </div>
    </PrivyProvider>
  );
}
