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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png"></link>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png"></link>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png"></link>
        <link rel="manifest" href="/favicons/site.webmanifest"></link>
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
