import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectWalletButton } from "@/components/portfolio-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ExternalLink, Home, RefreshCw, Share2, Sparkles } from "lucide-react";
import { AiOptimizer } from "@/components/ai-optimizer";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                 <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">BaseScan</h1>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/" isActive>
                      <Home />
                      Dashboard
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-2 space-y-2">
                <AiOptimizer userBalanceInEth={0} />
                <Button asChild variant="ghost" className="w-full justify-start">
                    <a href={`https://basescan.org/address/0x2d71De053e0DEFbCE58D609E36568d874D07e1a5`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink /> View on BaseScan
                    </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                    <Share2 /> Share on Farcaster
                </Button>
                 <Button variant="ghost" className="w-full justify-start">
                    <RefreshCw /> Refresh Data
                </Button>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex justify-between items-center p-4 border-b">
                <SidebarTrigger />
                 <h1 className="text-xl font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4">
                  <ConnectWalletButton />
                  <ThemeToggle />
                </div>
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
