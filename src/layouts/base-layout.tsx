import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import {Outlet} from "react-router";
import {Toaster} from "sonner";

const wallets = [new PetraWallet()];

export default function App() {
    return (
        <AptosWalletAdapterProvider optInWallets={wallets as any} autoConnect={false}>
            <Toaster />
            <Outlet />
        </AptosWalletAdapterProvider>
    );
}
