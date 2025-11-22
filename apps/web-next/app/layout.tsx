import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://iphey.org'),
  title: {
    default: 'IPhey - Browser Fingerprint & Digital Identity Inspector',
    template: '%s | IPhey',
  },
  description:
    'Free browser fingerprinting tool and digital identity inspector. Test your online privacy, analyze IP reputation, detect tracking, and understand what websites see about you. Used by security professionals, privacy enthusiasts, and developers.',
  keywords: [
    'browser fingerprinting',
    'digital privacy',
    'IP reputation',
    'fingerprint detection',
    'online tracking',
    'privacy tool',
    'browser tracking',
    'digital identity',
    'proxy testing',
    'VPN testing',
    'anti-fingerprinting',
    'GDPR compliance',
    'canvas fingerprinting',
    'WebGL fingerprinting',
  ],
  authors: [{ name: 'IPhey Team', url: 'https://iphey.org' }],
  creator: 'IPhey',
  publisher: 'IPhey',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iphey.org',
    title: 'IPhey - Browser Fingerprint & Digital Identity Inspector',
    description:
      'Free browser fingerprinting tool and digital identity inspector. Test your online privacy, analyze IP reputation, and understand what websites see about you.',
    siteName: 'IPhey',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPhey - Browser Fingerprint & Digital Identity Inspector',
    description:
      'Free browser fingerprinting tool and digital identity inspector. Test your online privacy, analyze IP reputation, and understand what websites see about you.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://iphey.org',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'IPhey',
    applicationCategory: 'SecurityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free browser fingerprinting tool and digital identity inspector. Test your online privacy, analyze IP reputation, detect tracking, and understand what websites see about you.',
    operatingSystem: 'Web Browser',
    url: 'https://iphey.org',
    author: {
      '@type': 'Organization',
      name: 'IPhey',
      url: 'https://iphey.org',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@iphey.com',
        contactType: 'Customer Support',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    featureList: [
      'Browser fingerprinting detection',
      'IP reputation analysis',
      'Digital identity inspection',
      'Privacy toolkit',
      'Real-time monitoring',
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="antialiased bg-surface text-white">{children}</body>
    </html>
  );
}
