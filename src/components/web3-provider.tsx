"use client";

import React, { ReactNode } from "react";
import { AppKitProvider, AppKitOptions } from "@reown/appkit";
import { AppKitAdapterWagmi } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

const options: AppKitOptions = {
  adapter: new AppKitAdapterWagmi(),
  siweEnabled: true,
};

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider options={options}>{children}</AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
