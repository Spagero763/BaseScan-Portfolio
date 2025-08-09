import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';

export const metadata: Metadata = {
  title: "BaseScan Portfolio",
  description: "Track your Base network portfolio performance in real-time",
  openGraph: {
    title: "BaseScan Portfolio",
    description: "Track your Base network portfolio performance in real-time",
    images: [`${appUrl}/portfolio-preview.png`],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${appUrl}/api/portfolio-image`,
    "fc:frame:button:1": "Check Portfolio",
    "fc:frame:button:2": "View Vault",
    "fc:frame:button:3": "Share Performance",
    "fc:frame:post_url": `${appUrl}/api/frame-action`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
