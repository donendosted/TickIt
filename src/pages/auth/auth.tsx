import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { MeshGradient } from "@paper-design/shaders-react";
import axios from "axios";
import {toast} from "sonner";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from "../../components/ui/input-otp"
import {Input} from "../../components/ui/input.tsx";
import Address from "../../components/address.tsx";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

const ls = {
    get: (k: string) => {
        try {
            return JSON.parse(localStorage.getItem(k) || "null");
        } catch {
            return localStorage.getItem(k);
        }
    },
    set: (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v)),
};


const Auth = () => {
    const navigate = useNavigate();

    const [address, setAddress] = useState(ls.get("address"));
    const [email, setEmail] = useState(ls.get("email"));
    const [name, setName] = useState(ls.get("name"));
    const [verified, setVerified] = useState(ls.get("verified") === true);

    useEffect(() => {
        if (address && email && name && verified) {
            navigate("/dashboard");
        }
    }, [address, email, name, verified]);``

    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
            <MeshGradient
                width="100%"
                height="100%"
                colors={["#bdbdbd", "#0d0d0d"]}
                distortion={1}
                swirl={0.1}
                speed={1}
                rotation={90}
                className="absolute inset-0 -z-10"
            />

            <div className="w-[95vw] max-w-xl min-h-[26rem] p-8 bg-stone-800/95 backdrop-blur-xl border border-stone-700/60 rounded-xl shadow-2xl flex items-center justify-center">
                {!address && <Address onSuccess={setAddress} />}
                {address && !email && <Email onSuccess={setEmail} />}
                {email && !name && <Name onSuccess={setName} />}
                {name && !verified && <OtpAsk onVerified={() => setVerified(true)} />}
            </div>
        </div>
    );
};

function OtpAsk({ onVerified }: { onVerified: () => void }) {
    const [value, setValue] = useState("");

    const verify = async () => {
        await axios.post(`${backend}/api/verify`, { otp: value });
        ls.set("verified", true);
        onVerified();
        toast.success("Verified");
    };

    return (
        <div className="space-y-6">
            <InputOTP maxLength={4} value={value} onChange={setValue}>
                <InputOTPGroup>
                    {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
            </InputOTP>

            <button onClick={verify} className="btn-primary w-full">
                Verify
            </button>
        </div>
    );
}


function Name({ onSuccess }: { onSuccess: (n: string) => void }) {
    const [name, setName] = useState("");

    const submit = async () => {
        await axios.post(`${backend}/api/name`, { name });
        ls.set("name", name);
        onSuccess(name);
    };

    return (
        <div className="w-full space-y-4">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
            <button onClick={submit} className="btn-primary">Continue</button>
        </div>
    );
}


function Email({ onSuccess }: { onSuccess: (e: string) => void }) {
    const [email, setEmail] = useState("");

    const submit = async () => {
        await axios.post(`${backend}/api/email`, { email });
        ls.set("email", email);
        onSuccess(email);
    };

    return (
        <div className="w-full space-y-4">
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <button onClick={submit} className="btn-primary">Continue</button>
        </div>
    );
}



export default Auth;
