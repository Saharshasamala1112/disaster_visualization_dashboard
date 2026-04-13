import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#22c55e",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://disaster-visualization-dashboard.vercel.app"),
  title: "Disaster Response Dashboard",
  description: "Enterprise-grade real-time disaster monitoring, response coordination, and situational awareness platform",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Disaster Ops",
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
  keywords: ["disaster", "emergency", "response", "monitoring", "hazard", "real-time"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://disaster-dashboard.vercel.app",
    title: "Disaster Response Dashboard",
    description: "Real-time disaster monitoring & response coordination platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Disaster Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disaster Response Dashboard",
    description: "Real-time disaster monitoring & response coordination",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Disaster Ops" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="msapplication-TileColor" content="#09090b" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className="bg-zinc-950 text-white antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker
                .register('/sw.js')
                .then(reg => console.log('[PWA] Service Worker registered'))
                .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
            });
          }
        `,
      }}
    />
  );
}