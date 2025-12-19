import { GrainGradient } from "@paper-design/shaders-react";
import { useNavigate } from "react-router-dom";

const App = () => {

    const nav = useNavigate();
    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
            <h1
                className="
                    text-4xl font-bold text-white
                    animate-[neon_2s_ease-in-out_infinite]
                    absolute
                    "
            >
                TICK IT!
            </h1>

            <GrainGradient
                width="100%"
                height="100%"
                colors={["#2a004d", "#4a2a55", "#00394d", "#120033"]}
                colorBack="#000000"
                softness={0.8}
                intensity={0.8}
                noise={0.25}
                shape="corners"
                speed={1}
                className="absolute inset-0 -z-10"
            />

            <div className="p-[2px] rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:shadow-[0_0_70px_rgba(168,85,247,0.9)] transition-shadow duration-300">
                <button
                    className="
                      relative flex items-center gap-3
                      px-16 py-6 rounded-full
                      text-lg font-semibold text-white
                      bg-neutral-950
                      overflow-hidden
                      transition-all duration-300
                      hover:gap-5
                      hover:scale-[1.05]
                      active:scale-95
                    "
                    onClick={() => nav('/login')}
                >
                    <span className="relative z-10">Get Started</span>
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                </button>
            </div>
        </div>
    );
};

export default App;
