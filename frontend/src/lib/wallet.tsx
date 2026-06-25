import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletState>({
  address: null,
  connected: false,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

function readAddress(): string | null {
  try {
    if (!isConnected()) return null;
    const data: any = getLocalStorage();
    return data?.addresses?.stx?.[0]?.address ?? null;
  } catch {
    return null;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setAddress(readAddress());
  }, []);

  async function connectWallet() {
    setConnecting(true);
    try {
      await connect();
      setAddress(readAddress());
    } finally {
      setConnecting(false);
    }
  }

  function disconnectWallet() {
    disconnect();
    setAddress(null);
  }

  return (
    <WalletContext.Provider
      value={{ address, connected: !!address, connecting, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
