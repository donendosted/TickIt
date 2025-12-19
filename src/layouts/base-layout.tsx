import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import {Outlet} from "react-router";

const wallets = [new PetraWallet()];

export default function App() {
    return (
        <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
            <Outlet />
        </AptosWalletAdapterProvider>
    );
}
