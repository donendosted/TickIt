import React, { useEffect, useState } from "react";
import { 
  Plus, Calendar, Share2, X, Check, Ticket, DollarSign, 
  Lock, Unlock, AlertCircle, Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

// Mock data for demo
const MOCK_EVENTS = [
  {
    id: "1",
    eventName: "Web3 Conference 2025",
    eventDescription: "Annual conference discussing the future of decentralized web",
    mode: "in-person",
    date: "2025-03-15",
    time: "10",
    location: "San Francisco, CA",
    ticketPrice: 0.5,
    permission: "open",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=400&h=300&fit=crop",
    maxSeats: 500,
    soldSeats: 120,
    hostAddress: "0x123...",
  },
  {
    id: "2",
    eventName: "Blockchain Workshop",
    eventDescription: "Hands-on workshop for developers learning Solidity and smart contracts",
    mode: "virtual",
    date: "2025-02-10",
    time: "14",
    location: "Virtual",
    ticketPrice: 0.1,
    permission: "approval",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    maxSeats: 100,
    soldSeats: 98,
    hostAddress: "0x456...",
  },
  {
    id: "3",
    eventName: "Crypto Meetup",
    eventDescription: "Monthly meetup for crypto enthusiasts and developers",
    mode: "in-person",
    date: "2025-01-30",
    time: "18",
    location: "New York, NY",
    ticketPrice: 0,
    permission: "open",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    maxSeats: 50,
    soldSeats: 50,
    hostAddress: "0x789...",
  },
];

// Constants
const INITIAL_FORM_STATE = {
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
};

const MODES = ["virtual", "in-person"];
const PERMISSIONS = [
  { value: "open", label: "Open" },
  { value: "approval", label: "Approval Required" }
];

// Validation Helper
function validateEventForm(formData) {
  const errors = {};

  if (!formData.eventName?.trim()) {
    errors.eventName = "Event name is required";
  }

  if (!formData.eventDescription?.trim()) {
    errors.eventDescription = "Description is required";
  }

  if (!formData.date) {
    errors.date = "Date is required";
  } else {
    const selectedDate = new Date(formData.date);
    if (selectedDate < new Date()) {
      errors.date = "Event date must be in the future";
    }
  }

  if (formData.time === "" || formData.time === null) {
    errors.time = "Time is required";
  } else if (formData.time < 0 || formData.time > 23) {
    errors.time = "Time must be between 0-23";
  }

  if (formData.maxSeats < 1) {
    errors.maxSeats = "At least 1 seat is required";
  }

  if (formData.ticketPrice < 0) {
    errors.ticketPrice = "Price cannot be negative";
  }

  return errors;
}

// Utility Functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (hourString) => {
  const hour = Number(hourString);
  if (isNaN(hour)) return "Invalid";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

const getAvailableSeats = (event) => event.maxSeats - (event.soldSeats || 0);

// Event Card Component
function EventCard({ event, onClick }) {
  const availableSeats = getAvailableSeats(event);
  const isSoldOut = availableSeats <= 0;

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition hover:scale-105 rounded-lg overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-blue-900 to-slate-900 overflow-hidden flex-shrink-0">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.eventName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="text-slate-600" size={48} />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Permission Badge */}
        <div className="flex items-center gap-2">
          {event.permission === "open" ? (
            <Unlock size={14} className="text-green-400" />
          ) : (
            <Lock size={14} className="text-yellow-400" />
          )}
          <span className="text-xs font-medium text-slate-400 capitalize">
            {event.permission}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white truncate flex-1">
          {event.eventName}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar size={14} />
          <span>
            {formatDate(event.date)} · {formatTime(event.time)}
          </span>
        </div>

        {/* Seats */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Ticket size={14} />
          <span className={isSoldOut ? "text-red-400 font-medium" : ""}>
            {availableSeats}/{event.maxSeats} seats
          </span>
        </div>

        {/* Price */}
        {event.ticketPrice > 0 && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
            <DollarSign size={14} />
            <span>{event.ticketPrice} ETH</span>
          </div>
        )}

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="bg-red-500/20 border border-red-500/50 rounded px-2 py-1 text-center mt-2">
            <span className="text-xs font-medium text-red-400">Sold Out</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-blue-400" size={32} />
    </div>
  );
}

// Empty State Component
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="text-slate-600 mb-4" size={48} />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

// Error State Component
function ErrorState({ message }) {
  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
        <p className="text-red-400 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Create Event Form Component
function CreateEventForm({ formData, onInputChange, onSubmit, isLoading, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Event Name *</label>
        <input
          name="eventName"
          value={formData.eventName}
          onChange={onInputChange}
          placeholder="Enter event name"
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
        />
        {errors.eventName && (
          <p className="text-red-400 text-xs mt-1">{errors.eventName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">Description *</label>
        <textarea
          name="eventDescription"
          value={formData.eventDescription}
          onChange={onInputChange}
          placeholder="Describe your event"
          disabled={isLoading}
          rows="3"
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
        />
        {errors.eventDescription && (
          <p className="text-red-400 text-xs mt-1">{errors.eventDescription}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Mode</label>
          <select
            name="mode"
            value={formData.mode}
            onChange={onInputChange}
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white disabled:opacity-50"
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={onInputChange}
            placeholder={formData.mode === "virtual" ? "Virtual" : "City, Country"}
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onInputChange}
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white disabled:opacity-50"
          />
          {errors.date && (
            <p className="text-red-400 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Time (0-23) *</label>
          <input
            type="number"
            name="time"
            value={formData.time}
            onChange={onInputChange}
            placeholder="0-23"
            min="0"
            max="23"
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
          />
          {errors.time && (
            <p className="text-red-400 text-xs mt-1">{errors.time}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Ticket Price (ETH)</label>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={onInputChange}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
          />
          {errors.ticketPrice && (
            <p className="text-red-400 text-xs mt-1">{errors.ticketPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Max Seats *</label>
          <input
            type="number"
            name="maxSeats"
            value={formData.maxSeats}
            onChange={onInputChange}
            placeholder="1"
            min="1"
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
          />
          {errors.maxSeats && (
            <p className="text-red-400 text-xs mt-1">{errors.maxSeats}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">Permission *</label>
        <select
          name="permission"
          value={formData.permission}
          onChange={onInputChange}
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white disabled:opacity-50"
        >
          {PERMISSIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">Image URL</label>
        <input
          name="imageUrl"
          value={formData.imageUrl}
          onChange={onInputChange}
          placeholder="https://..."
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white placeholder-slate-500 disabled:opacity-50"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:opacity-50 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Creating...
          </>
        ) : (
          <>
            <Check size={16} />
            Create Event
          </>
        )}
      </button>
    </div>
  );
}

// Event Details Modal Component
function EventDetailsModal({ event, onClose, onJoin }) {
  if (!event) return null;

  const availableSeats = getAvailableSeats(event);
  const isSoldOut = availableSeats <= 0;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.eventName,
          text: event.eventDescription,
          url: window.location.href,
        });
      } else {
        const text = `Check out "${event.eventName}" at ${window.location.href}`;
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Close button */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold">{event.eventName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.eventName}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}

          <p className="text-slate-300">{event.eventDescription}</p>

          <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket size={14} />
              <span>{availableSeats} seats left</span>
            </div>
          </div>

          {event.location && (
            <p className="text-sm text-slate-400">
              📍 {event.location}
            </p>
          )}

          {event.ticketPrice > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded p-3 text-center">
              <p className="text-emerald-400 font-semibold">
                {event.ticketPrice} ETH per ticket
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={onJoin}
              disabled={isSoldOut}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Ticket size={16} />
              {isSoldOut ? "Sold Out" : "Join Event"}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function EventDashboard() {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all events from backend
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backend}/api/events`);
      setEvents(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
      setEvents(MOCK_EVENTS); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events the user has participated in
  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backend}/api/ticket/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setJoinedEvents(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error fetching my events:", err);
      // Don't show error for my events as user might not be logged in
      setJoinedEvents([]); // Fallback to empty array
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
    fetchMyEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCreateEvent = async () => {
    const errors = validateEventForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backend}/api/events`,
        formData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      // Add the new event to the list
      const newEvent = response.data.data || response.data;
      setEvents((prev) => [newEvent, ...prev]);
      
      // Reset form and close sidebar
      setFormData(INITIAL_FORM_STATE);
      setFormErrors({});
      setSidebarOpen(false);
      toast.success("Event created successfully!");
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinEvent = (event) => {
    setJoinedEvents((prev) => 
      prev.find(e => e.id === event.id) ? prev : [event, ...prev]
    );
    setSelectedEvent(null);
    toast.success(`Successfully joined "${event.eventName}"!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">EventHub</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center gap-2"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-slate-800 mb-8">
          {["available", "joined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium transition-colors ${
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab === "available" ? "Available Events" : "Joined Events"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "available" && (
          <div>
            {error && <ErrorState message={error} />}
            {isLoading ? (
              <LoadingState />
            ) : events.length === 0 ? (
              <EmptyState message="No events available yet. Be the first to create one!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "joined" && (
          <div>
            {joinedEvents.length === 0 ? (
              <EmptyState message="You haven't joined any events yet. Explore available events above!" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Event Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Event</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-800 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <CreateEventForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleCreateEvent}
              isLoading={isCreating}
              errors={formErrors}
            />
          </div>
        </>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoin={() => handleJoinEvent(selectedEvent)}
        />
      )}
    </div>
  );
}