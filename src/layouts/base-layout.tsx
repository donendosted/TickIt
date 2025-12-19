import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import {Outlet} from "react-router";

export default function App() {
    return (
        <AptosWalletAdapterProvider optInWallets={["Petra"]} autoConnect={false}>
            <Outlet />
        </AptosWalletAdapterProvider>
    );
}
