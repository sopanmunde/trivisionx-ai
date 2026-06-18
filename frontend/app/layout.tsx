import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://trivisionx.ai'),
  title: 'trivisionx.ai',
  description: 'Created by Sopan\n TriVisionX AI is an enterprise-grade AI research platform that combines multi-agent intelligence, semantic search, and automated knowledge discovery to transform information into actionable insights.',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'trivisionx.ai — Enterprise Agentic Research Platform',
    description: 'TriVisionX AI is an enterprise-grade AI research platform that combines multi-agent intelligence, semantic search, and automated knowledge discovery to transform information into actionable insights.',
    url: 'https://trivisionx.ai',
    siteName: 'TriVisionX AI',
    images: [
      {
        url: '/og/og.png',
        width: 1200,
        height: 630,
        alt: 'TriVisionX AI — Enterprise Agentic Research Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'trivisionx.ai — Enterprise Agentic Research Platform',
    description: 'TriVisionX AI is an enterprise-grade AI research platform that combines multi-agent intelligence, semantic search, and automated knowledge discovery to transform information into actionable insights.',
    images: ['/og/og.png'],
  },
}

import { Toaster } from '@/components/ui/sonner';

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="bottom-right" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

