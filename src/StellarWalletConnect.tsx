import { useEffect, useRef } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  modules: allowAllModules(),
});

export default function StellarWalletConnect({ onConnect, onDisconnect }: {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      kit.createButton({
        container: containerRef.current,
        onConnect: ({ address }) => {
          console.log("Connected address:", address);
          onConnect(address);
        },
        onDisconnect: () => {
          console.log("Disconnected");
          onDisconnect();
        },
      });
    }
  }, [onConnect, onDisconnect]);

  return <div ref={containerRef} style={{ minHeight: 48 }} />;
}