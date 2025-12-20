import React, { useEffect, useState } from "react";
import {
    Plus,
    Calendar,
    Share2,
    X,
    Check,
    Ticket,
    DollarSign,
    Lock,
    Unlock,
} from "lucide-react";
import axios from "axios";

import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL

export default function EventDashboard() {
    /* ---------- state ---------- */
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<"available" | "joined">("available");

    const [events, setEvents] = useState<any[]>([]);
    const [joinedEvents, setJoinedEvents] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        eventName: "",
        eventDescription: "",
        mode: "virtual",
        date: "",
        time: "",
        location: "",
        ticketPrice: 0,
        permission: "open",
        imageUrl: "",
        maxSeats: 1,
    });

    const address = localStorage.getItem("address");

    /* ---------- fetch events ---------- */
    useEffect(() => {
        axios
            .get(`${backend}/api/events`)
            .then((res) => setEvents(res.data || []))
            .catch(console.error);
    }, []);

    /* ---------- fetch joined ---------- */
    useEffect(() => {
        if (!address) return;

        axios
            .get(`${backend}/api/tickets/my`, { params: { address } })
            .then((res) => setJoinedEvents(res.data || []))
            .catch(console.error);
    }, [address]);

    /* ---------- helpers ---------- */
    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type } = e.target;
        setFormData((p) => ({
            ...p,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const formatTime = (h: string) => {
        const n = Number(h);
        return n >= 12 ? `${n === 12 ? 12 : n - 12}:00 PM` : `${n}:00 AM`;
    };

    /* ---------- create ---------- */
    const handleCreateEvent = async () => {
        if (!address) return alert("Wallet not connected");

        try {
            const res = await axios.post(`${backend}/api/events`, {
                ...formData,
                date: new Date(formData.date),
                hostAddress: address,
                eventBlockchainId: Date.now(),
            });

            setEvents((p) => [res.data, ...p]);
            setSidebarOpen(false);
        } catch (e) {
            console.error(e);
            alert("Create failed");
        }
    };

    /* ---------- share ---------- */
    const handleShare = (event: any) => {
        try {
            if (navigator.share) {
                navigator.share({
                    title: event.eventName,
                    text: event.eventDescription,
                    url: window.location.href,
                });
            }
        } catch {}
    };

    /* ---------- card ---------- */
    const EventCard = ({ event }: { event: any }) => (
        <Card
            onClick={() => setSelectedEvent(event)}
            className="min-w-[300px] bg-slate-900/60 border-slate-800 hover:border-slate-700 cursor-pointer transition hover:scale-105"
        >
            <CardContent className="p-0">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
                    {event.imageUrl ? (
                        <img src={event.imageUrl} className="w-full h-full object-cover"  alt="undefined"/>
                    ) : (
                        <Calendar className="w-14 h-14 text-white/90" />
                    )}

                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-full text-xs flex gap-1">
                        {event.permission === "open" ? <Unlock size={12} /> : <Lock size={12} />}
                        {event.permission}
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    <h3 className="font-bold">{event.eventName}</h3>
                    <div className="text-sm text-slate-400">
                        {formatDate(event.date)} · {formatTime(event.time)}
                    </div>
                    <div className="text-sm text-slate-400">
                        {event.soldSeats}/{event.maxSeats} seats
                    </div>

                    {event.ticketPrice > 0 && (
                        <div className="text-green-400 text-xs flex items-center gap-1">
                            <DollarSign size={12} /> {event.ticketPrice} ETH
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    /* ---------- render ---------- */
    return (
        <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
            {/* navbar */}
            <nav className="border-b border-slate-800 bg-slate-900/50">
                <div className="px-6 py-4 flex justify-between">
                    <h1 className="text-xl font-bold">EventHub</h1>
                    <Button onClick={() => setSidebarOpen(true)}>
                        <Plus size={18} className="mr-2" /> Create
                    </Button>
                </div>
            </nav>

            {/* content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* tabs */}
                <div className="flex gap-6 border-b border-slate-800">
                    {["available", "joined"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t as any)}
                            className={`pb-3 ${
                                activeTab === t
                                    ? "text-blue-400 border-b-2 border-blue-400"
                                    : "text-slate-400"
                            }`}
                        >
                            {t === "available" ? "Available Events" : "Joined Events"}
                        </button>
                    ))}
                </div>

                {activeTab === "available" && (
                    <div className="flex gap-6 overflow-x-auto">
                        {events.map((e) => (
                            <EventCard key={e._id} event={e} />
                        ))}
                    </div>
                )}

                {activeTab === "joined" && (
                    <div className="flex gap-6 overflow-x-auto">
                        {joinedEvents.length === 0 ? (
                            <p className="text-slate-500">No joined events</p>
                        ) : (
                            joinedEvents.map((e) => <EventCard key={e._id} event={e} />)
                        )}
                    </div>
                )}
            </div>

            {/* sidebar */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-800 p-6 z-50 overflow-y-auto">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-xl font-bold">Create Event</h2>
                            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                                <X />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Event Name</Label>
                                <Input name="eventName" onChange={handleInputChange} />
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea name="eventDescription" onChange={handleInputChange} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input type="date" name="date" onChange={handleInputChange} />
                                <Input type="number" name="time" placeholder="0-23" onChange={handleInputChange} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input type="number" name="ticketPrice" placeholder="ETH" onChange={handleInputChange} />
                                <Input type="number" name="maxSeats" placeholder="Seats" onChange={handleInputChange} />
                            </div>

                            <select
                                name="permission"
                                onChange={handleInputChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2"
                            >
                                <option value="open">Open</option>
                                <option value="approval">Approval</option>
                            </select>

                            <Input name="imageUrl" placeholder="Image URL" onChange={handleInputChange} />

                            <Button onClick={handleCreateEvent} className="w-full">
                                <Check className="mr-2" /> Create Event
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* dialog (hard-guarded) */}
            {selectedEvent && (
                <Dialog open onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>{selectedEvent.eventName}</DialogTitle>
                        </DialogHeader>

                        <p className="text-slate-400">{selectedEvent.eventDescription}</p>

                        <div className="flex gap-2">
                            <Button className="flex-1">
                                <Ticket size={16} className="mr-2" /> Join (ticket flow)
                            </Button>
                            <Button variant="outline" onClick={() => handleShare(selectedEvent)}>
                                <Share2 size={16} />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
