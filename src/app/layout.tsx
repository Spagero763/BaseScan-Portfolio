import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarActions } from "@/components/portfolio-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExternalLink, Home, Sparkles } from "lucide-react";
import { AiOptimizer } from "@/components/ai-optimizer";
import { Web3Provider } from "@/components/web3-provider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';

export const metadata: Metadata = {
  title: "BaseScan Portfolio",
  description: "Track your Base network portfolio performance in real-time",
  keywords: ["Base", "Ethereum", "Portfolio", "DeFi", "Web3", "Cryptocurrency"],
  authors: [{ name: "BaseScan Portfolio Team" }],
  openGraph: {
    title: "BaseScan Portfolio",
    description: "Track your Base network portfolio performance in real-time",
    images: [`${appUrl}/portfolio-preview.png`],
    type: "website",
    siteName: "BaseScan Portfolio",
  },
  twitter: {
    card: "summary_large_image",
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
          <Web3Provider>
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
                  <SidebarActions />
                </SidebarFooter>
              </Sidebar>
              <SidebarInset>
                <header className="flex justify-between items-center p-4 border-b">
                  <SidebarTrigger />
                   <h1 className="text-xl font-semibold">Dashboard</h1>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                  </div>
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </Web3Provider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}