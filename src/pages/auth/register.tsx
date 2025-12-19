import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function FollowUpForm() {
    const navigate = useNavigate();

    const [step, setStep] = useState<"wallet" | "email" | "name">("wallet");
    const [address, setAddress] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // called by <AptosConnect />
    const onWalletSuccess = (addr: string) => {
        setAddress(addr);
        setStep("email");
    };

    const post = async (url: string, body: { address: string; email: string;  }) => {
        const res = await fetch(`${BACKEND}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Request failed");
        return res.json();
    };

    const submitEmail = async () => {
        if (!address || !email) return;
        setLoading(true);
        try {
            await post("/api/verify", { address, email });
            setStep("name");
        } finally {
            setLoading(false);
        }
    };

    const submitName = async () => {
        if (!address || !name) return;
        setLoading(true);
        try {
            await post("/api/profile", {address, name});
            navigate("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-24 space-y-6">
            {step === "wallet" && (
                <AptosConnect onSuccess={onWalletSuccess} />
            )}

            {step === "email" && (
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 rounded bg-neutral-900 border border-neutral-700"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        onClick={submitEmail}
                        className="w-full py-2 rounded bg-white text-black"
                    >
                        Continue
                    </button>
                </div>
            )}

            {step === "name" && (
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Full name"
                        className="w-full px-4 py-2 rounded bg-neutral-900 border border-neutral-700"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        disabled={loading}
                        onClick={submitName}
                        className="w-full py-2 rounded bg-white text-black"
                    >
                        Finish
                    </button>
                </div>
            )}
        </div>
    );
}
