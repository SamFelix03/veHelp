import React, { createContext, useContext, useState, useEffect } from "react";
import { DAppKitUI } from "@vechain/dapp-kit-ui";

interface VeChainWalletContextType {
  address: string | null;
  isConnected: boolean;
  isInitialized: boolean;
  connect: () => void;
  disconnect: () => void;
}

const VeChainWalletContext = createContext<VeChainWalletContextType | null>(null);

export const useVeChainWallet = () => {
  const context = useContext(VeChainWalletContext);
  if (!context) {
    throw new Error("useVeChainWallet must be used within VeChainWalletProvider");
  }
  return context;
};

export const VeChainWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize DAppKitUI
    try {
      const walletConnectOptions = {
        projectId: 'e80eb1e41c28394aa2d9fa14862cbbfa', // Your Reown project ID
        metadata: {
          name: 'veHelp DApp',
          description: 'Disaster Relief Fund Management',
          url: window.location.origin,
          icons: [`${window.location.origin}/hand.PNG`],
        },
      };

      DAppKitUI.configure({
        node: 'https://testnet.vechain.org/',
        walletConnectOptions,
        usePersistence: true,
      });

      // Subscribe to wallet state changes
      DAppKitUI.wallet.subscribeToKey('address', (newAddress) => {
        setAddress(newAddress || null);
        setIsConnected(!!newAddress);
      });

      // Check if already connected
      const currentAddress = DAppKitUI.wallet.state.address;
      if (currentAddress) {
        setAddress(currentAddress);
        setIsConnected(true);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize VeChain DAppKit:', error);
    }
  }, []);

  const connect = () => {
    try {
      DAppKitUI.modal.open();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
    }
  };

  const disconnect = () => {
    try {
      // Disconnect using DAppKitUI wallet manager
      DAppKitUI.wallet.disconnect();
      
      // Clear local state
      setAddress(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
      
      // Fallback: just clear local state
      setAddress(null);
      setIsConnected(false);
    }
  };

  return (
    <VeChainWalletContext.Provider
      value={{
        address,
        isConnected,
        isInitialized,
        connect,
        disconnect,
      }}
    >
      {children}
    </VeChainWalletContext.Provider>
  );
};

