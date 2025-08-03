// app/layout.tsx
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Avery Peterson',
  description: 'Personal website of Avery Peterson',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
