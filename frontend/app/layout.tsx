import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://trivisionx-ai.vercel.app'),
  title: 'trivisionx',
  description: 'TriVisionX is an enterprise-grade AI research platform that combines multi-agent intelligence, semantic search, and automated knowledge discovery to transform information into actionable insights.',
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
    title: 'trivisionx — Enterprise Agentic Research Platform',
    description: 'TriVisionX is an enterprise-grade AI research platform that combines multi-agent intelligence, semantic search, and automated knowledge discovery to transform information into actionable insights.',
    url: 'https://trivisionx-ai.vercel.app',
    siteName: 'TriVisionX',
    images: [
      {
        url: '/og/og.png',
        width: 1200,
        height: 630,
        alt: 'TriVisionX — Enterprise Agentic Research Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'trivisionx — Enterprise Agentic Research Platform',
    description: 'TriVisionX is an enterprise-grade AI research platform that combines multi-agent intelligence, semantic search, and automated knowledge discovery to transform information into actionable insights.',
    images: ['/og/og.png'],
  },
}

import { Toaster } from '@/components/ui/sonner';

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalCommandPalette } from "@/components/global-command-palette";

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
            <GlobalCommandPalette />
          </TooltipProvider>
          <Toaster position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
