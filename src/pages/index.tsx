import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card"


const features = [
    {
        "title": "Fast Event Creation",
        "body": "Set up events in seconds with a clean and simple interface.",
        "screenshot": "../assets/screenshot.png"
    },
    {
        "title": "Auto Ticketing",
        "body": "Generate shareable event tickets instantly.",
        "screenshot": "../assets/screenshot.png"
    },
    {
        "title": "Analytics Dashboard",
        "body": "Track attendee insights and engagement metrics.",
        "screenshot": "../../assets/screenshot.png"
    }
]

export default function App() {
    const nav = useNavigate();

    return (
        <div className="w-full h-screen snap-y snap-mandatory overflow-y-scroll">

            {/* HERO */}
            <section className="relative h-screen snap-start flex items-center justify-center text-center text-white">
                <div className="shader-bg absolute inset-0 -z-10"></div>

                <div className="space-y-6 px-6 max-w-3xl">
                    <h1 className="text-6xl font-bold">Plan. Organize. Host.</h1>
                    <p className="text-xl opacity-90">
                        A modern minimal event experience crafted for creators & communities.
                    </p>

                    <Button
                        size="lg"
                        className="mt-4"
                        onClick={() => nav("/signup")}
                    >
                        Get Started
                    </Button>
                </div>
            </section>

            {/* EVENTS TABLE */}
            <section className="relative h-screen snap-start flex justify-center items-center px-8">
                <div className="glow-bg absolute inset-0 -z-10"></div>

                <div className="w-full max-w-4xl bg-black/40 backdrop-blur-xl rounded-xl p-6">
                    <h2 className="text-3xl font-semibold text-white mb-6">Upcoming Events</h2>

                    <div className="overflow-y-scroll max-h-[70vh] pr-3">
                        <table className="w-full text-left text-white border-collapse">
                            <thead className="opacity-60 border-b border-white/20">
                            <tr>
                                <th className="py-3">Event</th>
                                <th className="py-3">Host</th>
                                <th className="py-3">Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Array.from({ length: 15 }).map((_, i) => (
                                <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="py-3">Community Meetup #{i + 1}</td>
                                    <td>Creator {i + 1}</td>
                                    <td>12 Dec 2025</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="h-screen snap-start flex flex-col items-center justify-center px-8 space-y-8">
                <h2 className="text-4xl font-semibold">Features</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                    {features.map((f, i) => (
                        <Card key={i} className="shadow-xl hover:scale-[1.02] transition">
                            <CardContent className="p-6 space-y-4">
                                <img
                                    src={f.screenshot}
                                    className="w-full h-40 object-cover rounded-lg"
                                    alt='img'/>
                                <h3 className="text-xl font-bold">{f.title}</h3>
                                <p className="text-sm opacity-70">{f.body}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="h-screen snap-start flex items-center justify-center bg-black text-white text-center">
                <p className="opacity-80">© 2025 EventFlow — All Rights Reserved.</p>
            </footer>
        </div>
    );
}
