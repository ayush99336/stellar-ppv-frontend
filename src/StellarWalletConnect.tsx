import { useEffect, useRef, useState } from "react";
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
  const [buttonCreated, setButtonCreated] = useState(false);

  useEffect(() => {
    if (containerRef.current && !buttonCreated) {
      try {
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
        setButtonCreated(true);
      } catch (error) {
        console.warn("Button already exists:", error);
      }
    }
  }, [onConnect, onDisconnect, buttonCreated]);

  return <div ref={containerRef} style={{ minHeight: 48 }} />;
}