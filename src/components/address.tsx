import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

const Address = ({ onSuccess }: { onSuccess: (a: string) => void }) => {
    const { connect, account, connected } = useWallet();
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            if (!connected) {
                try {
                    await connect("Petra");
                } catch (err) {
                    window.open("https://petra.app", "_blank");
                    return;
                }
            }

            let addr = account?.address?.toString();

            if (!addr && (window as any).aptos?.account) {
                const acc = await (window as any).aptos.account();
                addr = acc?.address;
            }

            if (!addr) {
                for (let i = 0; i < 10; i++) {
                    await new Promise((r) => setTimeout(r, 200));
                    try {
                        if ((window as any).aptos?.account) {
                            const acc = await (window as any).aptos.account();
                            addr = acc?.address;
                        } else {
                            addr = account?.address?.toString();
                        }
                    } catch { /* ignore */ }
                    if (addr) break;
                }
            }

            if (!addr) {
                window.open("https://petra.app", "_blank");
                setLoading(false);
                return;
            }

            await axios.post(`${backend}/api/wallet/login`, { address: addr }).then((res) => {
                localStorage.setItem("token", res.data.data.token);
            });

            localStorage.setItem("address", addr);
            onSuccess(addr);
            toast.success("Wallet connected");
        } catch (e) {
            toast.error("Wallet connection failed");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            aria-busy={loading}
            className="relative text-4xl font-semibold text-white pb-2 hover:scale-105 transition disabled:opacity-60"
        >
            Connect to Aptos
            {loading && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-[length:200%_100%] animate-[gradient-move_1.5s_linear_infinite]" />
            )}
        </button>
    );
};

export default Address;
