import { useWallet } from "@aptos-labs/wallet-adapter-react";
import axios from "axios";
import { toast } from "sonner";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

const Address = ({ onSuccess }: { onSuccess: (a: string) => void }) => {
    const { connect, account, connected } = useWallet();

    const handleConnect = async () => {
        try {
            if (!connected) {
                await connect("Petra");
            }

            if (!account?.address) throw new Error("No address");

            const addressString = account.address.toString();

            await axios.post(`${backend}/api/wallet/login`, {
                address: addressString,
            });

            localStorage.setItem("address", addressString);
            onSuccess(addressString);
            toast.success("Wallet connected");
        } catch (e) {
            toast.error("Wallet connection failed");
            console.error(e);
        }
    };

    return (
        <button
            onClick={handleConnect}
            className="relative text-4xl font-semibold text-white pb-2 hover:scale-105 transition"
        >
            Connect to Aptos
            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-gray-200 via-slate-400 to-gray-200 animate-[gradient-move_2.5s_linear_infinite]" />
        </button>
    );
};

export default Address;
