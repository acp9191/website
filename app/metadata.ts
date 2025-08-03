import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avery Peterson',
  description:
    'Personal website of Avery Peterson, software engineer who loves good tools, good music, and clean code.',
  metadataBase: new URL('https://yourdomain.com'),

  openGraph: {
    title: 'Avery Peterson',
    description:
      'Personal website of Avery Peterson, software engineer who loves good tools, good music, and clean code.',
    url: 'https://yourdomain.com',
    siteName: 'Avery Peterson',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Avery Peterson Website',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Avery Peterson',
    description:
      'Personal website of Avery Peterson, software engineer who loves good tools, good music, and clean code.',
    creator: '@yourtwitter',
    images: ['https://yourdomain.com/og-image.jpg'],
  },

  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      es: '/es',
      fr: '/fr',
      it: '/it',
    },
  },
};
