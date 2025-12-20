import React, { useEffect, useState } from "react";
import { 
  Plus, Calendar, Share2, X, Check, Ticket, DollarSign, 
  Lock, Unlock, AlertCircle, Loader2, Copy, Download, Eye,
  BarChart3, TrendingUp, Users, Upload, Image as ImageIcon
} from "lucide-react";

const BACKEND_URL = "http://localhost:4000";

// Constants
const INITIAL_FORM_STATE = {
  eventName: "",
  eventDescription: "",
  mode: "virtual",
  date: "",
  time: "18:00",
  location: "",
  ticketPrice: "0",
  permission: "open",
  maxSeats: "1",
  banner: null,
  bannerPreview: null,
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

const formatTime = (timeString) => {
  if (!timeString) return "Invalid";
  
  const timeParts = timeString.includes(':') ? timeString.split(':') : [timeString];
  const timeNum = parseInt(timeParts[0]);
  
  if (isNaN(timeNum)) return "Invalid";
  const period = timeNum >= 12 ? "PM" : "AM";
  const displayHour = timeNum === 0 ? 12 : timeNum > 12 ? timeNum - 12 : timeNum;
  return `${displayHour}:${timeParts[1] || '00'} ${period}`;
};

const getAvailableSeats = (event) => (event.maxSeats || 0) - (event.soldSeats || 0);

// Event Card Component
function EventCard({ event, onClick, isPurchased = false, isHosted = false }) {
  const availableSeats = getAvailableSeats(event);
  const isSoldOut = availableSeats <= 0;

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition hover:scale-105 rounded-lg overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-blue-900 to-slate-900 overflow-hidden flex-shrink-0">
        {event.banner || event.imageUrl ? (
          <img
            src={event.banner || event.imageUrl}
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
        {!isPurchased && !isHosted && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Ticket size={14} />
            <span className={isSoldOut ? "text-red-400 font-medium" : ""}>
              {availableSeats}/{event.maxSeats} seats
            </span>
          </div>
        )}

        {/* Price */}
        {event.ticketPrice > 0 && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
            <DollarSign size={14} />
            <span>{event.ticketPrice} APT</span>
          </div>
        )}

        {/* Sold Out Badge */}
        {isSoldOut && !isPurchased && !isHosted && (
          <div className="bg-red-500/20 border border-red-500/50 rounded px-2 py-1 text-center mt-2">
            <span className="text-xs font-medium text-red-400">Sold Out</span>
          </div>
        )}

        {/* Ticket Purchased Badge */}
        {isPurchased && (
          <div className="bg-green-500/20 border border-green-500/50 rounded px-2 py-1 text-center mt-2">
            <span className="text-xs font-medium text-green-400">✓ Ticket Purchased</span>
          </div>
        )}

        {/* Hosted Badge */}
        {isHosted && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded px-2 py-1 text-center mt-2">
            <span className="text-xs font-medium text-blue-400">👤 You're Hosting</span>
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
function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-red-400 font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Event Form Component with File Upload
function CreateEventForm({ formData, onInputChange, onSubmit, isLoading, errors }) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        onInputChange({
          target: {
            name: 'banner',
            value: file,
            type: 'file',
          }
        });
        // Store preview separately
        onInputChange({
          target: {
            name: 'bannerPreview',
            value: reader.result,
            type: 'text',
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    onInputChange({
      target: {
        name: 'banner',
        value: null,
        type: 'file',
      }
    });
    onInputChange({
      target: {
        name: 'bannerPreview',
        value: null,
        type: 'text',
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Upload */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Event Banner Image
        </label>
        
        {formData.bannerPreview ? (
          <div className="relative group">
            <img
              src={formData.bannerPreview}
              alt="Banner preview"
              className="w-full h-32 object-cover rounded-lg border border-slate-700"
            />
            <button
              type="button"
              onClick={handleRemoveBanner}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-lg p-4 text-center transition disabled:opacity-50"
          >
            <Upload className="mx-auto mb-2 text-slate-400" size={24} />
            <p className="text-sm text-slate-400">
              Click to upload banner image
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </div>

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
          <label className="block text-sm font-medium text-white mb-1">Mode *</label>
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
          <label className="block text-sm font-medium text-white mb-1">Location *</label>
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
          <label className="block text-sm font-medium text-white mb-1">Time (HH:MM) *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={onInputChange}
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white disabled:opacity-50"
          />
          {errors.time && (
            <p className="text-red-400 text-xs mt-1">{errors.time}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Ticket Price (APT) *</label>
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

// Analytics Modal Component
function AnalyticsModal({ event, onClose }) {
  if (!event) return null;

  const availableSeats = getAvailableSeats(event);
  const occupancyRate = ((event.soldSeats / event.maxSeats) * 100).toFixed(1);
  const revenue = event.ticketPrice * event.soldSeats;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Close button */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 size={24} />
            Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Event Title */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
            <h3 className="text-lg font-semibold text-white">
              {event.eventName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {formatDate(event.date)} · {formatTime(event.time)}
            </p>
          </div>

          {/* Tickets Sold */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-300 mb-1">Tickets Sold</p>
                <p className="text-3xl font-bold text-blue-400">
                  {event.soldSeats}
                </p>
                <p className="text-xs text-blue-300 mt-1">
                  out of {event.maxSeats} total
                </p>
              </div>
              <Ticket className="text-blue-400" size={32} />
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-emerald-300 mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {occupancyRate}%
                </p>
                <p className="text-xs text-emerald-300 mt-1">
                  {availableSeats} seats remaining
                </p>
              </div>
              <TrendingUp className="text-emerald-400" size={32} />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-purple-500/20 border border-purple-500/50 rounded p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-purple-300 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-400">
                  {revenue.toFixed(2)} APT
                </p>
                <p className="text-xs text-purple-300 mt-1">
                  @{event.ticketPrice} APT per ticket
                </p>
              </div>
              <DollarSign className="text-purple-400" size={32} />
            </div>
          </div>

          {/* Availability */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
            <p className="text-xs text-slate-400 mb-3">Seats Availability</p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>0%</span>
              <span>{occupancyRate}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Mode:</span>
              <span className="text-white capitalize">{event.mode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Permission:</span>
              <span className="text-white capitalize">{event.permission}</span>
            </div>
            {event.location && event.location !== "null" && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Location:</span>
                <span className="text-white">{event.location}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Created:</span>
              <span className="text-white">{formatDate(event.createdAt)}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Ticket Details Modal Component
function TicketDetailsModal({ ticket, onClose }) {
  if (!ticket) return null;

  const event = ticket.eventId;

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `${event.eventName}-ticket-${ticket.participantAddress.slice(0, 6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRToClipboard = async () => {
    try {
      const img = await fetch(ticket.qrCode);
      const blob = await img.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('QR Code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy QR code:', error);
      alert('Failed to copy QR code');
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
          {/* Event Image */}
          {event.banner || event.imageUrl ? (
            <img
              src={event.banner || event.imageUrl}
              alt={event.eventName}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}

          <p className="text-slate-300">{event.eventDescription}</p>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket size={14} />
              <span>{formatTime(event.time)}</span>
            </div>
          </div>

          {event.location && event.location !== "null" && (
            <p className="text-sm text-slate-400">
              📍 {event.location}
            </p>
          )}

          {/* Price Info */}
          {event.ticketPrice > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded p-3 text-center">
              <p className="text-emerald-400 font-semibold">
                {event.ticketPrice} APT
              </p>
            </div>
          )}

          {/* Ticket Status */}
          <div className="bg-green-500/20 border border-green-500/50 rounded p-3 text-center">
            <p className="text-green-400 font-semibold">✓ Ticket Confirmed</p>
            <p className="text-xs text-green-300 mt-1">Valid: {ticket.valid ? 'Yes' : 'No'}</p>
          </div>

          {/* Participant Address */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Participant Address</p>
            <p className="font-mono text-xs text-slate-300 break-all">
              {ticket.participantAddress}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4 flex flex-col items-center">
            <p className="text-sm font-medium text-slate-300 mb-3">QR Code</p>
            {ticket.qrCode && (
              <img
                src={ticket.qrCode}
                alt="Ticket QR Code"
                className="w-48 h-48 border-2 border-slate-600 rounded"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={downloadQR}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download QR
            </button>
            <button
              onClick={copyQRToClipboard}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>

          {/* Ticket Created Date */}
          <p className="text-xs text-slate-500 text-center">
            Ticket issued: {formatDate(ticket.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Event Details Modal Component (For Purchasing)
function EventDetailsModal({ event, onClose, onPurchase, isPurchasing, isPurchased, onViewTicket }) {
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
          {event.banner || event.imageUrl && (
            <img
              src={event.banner || event.imageUrl}
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

          {event.location && event.location !== "null" && (
            <p className="text-sm text-slate-400">
              📍 {event.location}
            </p>
          )}

          {event.ticketPrice > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded p-3 text-center">
              <p className="text-emerald-400 font-semibold">
                {event.ticketPrice} APT per ticket
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {isPurchased ? (
              <button
                onClick={onViewTicket}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                View Ticket
              </button>
            ) : (
              <button
                onClick={onPurchase}
                disabled={isSoldOut || isPurchasing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 rounded-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <Ticket size={16} />
                    {isSoldOut ? "Sold Out" : "Buy Ticket"}
                  </>
                )}
              </button>
            )}
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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [analyticsEvent, setAnalyticsEvent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [events, setEvents] = useState([]);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState(null);

  const address = localStorage.getItem("address");
  const token = localStorage.getItem("token");

  // Fetch all events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      const response = await fetch(`${BACKEND_URL}/api/events`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setEvents(result.data);
        // Filter hosted events
        const hosted = result.data.filter(e => e.hostAddress?.toLowerCase() === address?.toLowerCase());
        setHostedEvents(hosted);
      } else {
        setEventsError("Failed to load events");
      }
    } catch (error) {
      setEventsError(error.message || "Failed to load events");
      console.error("Failed to fetch events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch purchased tickets
  useEffect(() => {
    if (!address || !token) {
      setPurchasedTickets([]);
      setTicketsLoading(false);
      return;
    }
    
    fetchPurchasedTickets();
  }, [address, token]);

  const fetchPurchasedTickets = async () => {
    try {
      setTicketsLoading(true);
      setTicketsError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/tickets/my?address=${address}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setPurchasedTickets(result.data);
      } else {
        setTicketsError("Failed to load tickets");
      }
    } catch (error) {
      setTicketsError(error.message || "Failed to load tickets");
      console.error("Failed to fetch tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      // File upload is handled separately
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCreateEvent = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    const errors = validateEventForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreating(true);
    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("eventName", formData.eventName);
      formDataToSend.append("eventDescription", formData.eventDescription);
      formDataToSend.append("mode", formData.mode);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("ticketPrice", formData.ticketPrice);
      formDataToSend.append("permission", formData.permission);
      formDataToSend.append("maxSeats", formData.maxSeats);
      formDataToSend.append("eventBlockchainId", Date.now().toString());
      
      // Add banner file if present
      if (formData.banner) {
        formDataToSend.append("banner", formData.banner);
      }

      const response = await fetch(`${BACKEND_URL}/api/events`, {
        method: "POST",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // Don't set Content-Type header, let browser set it with boundary
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success || response.ok) {
        const newEvent = result.data || result;
        setEvents((prev) => [newEvent, ...prev]);
        
        if (newEvent.hostAddress?.toLowerCase() === address?.toLowerCase()) {
          setHostedEvents((prev) => [newEvent, ...prev]);
        }
        
        setFormData(INITIAL_FORM_STATE);
        setFormErrors({});
        setSidebarOpen(false);
        alert("Event created successfully!");
      } else {
        alert(result.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      alert(error.message || "Failed to create event. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePurchaseTicket = async (event) => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets/buy/${event._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          participantAddress: address,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSelectedEvent(null);
        alert(`Successfully purchased ticket for "${event.eventName}"!`);
        fetchPurchasedTickets();
      } else {
        alert(result.message || "Failed to purchase ticket");
      }
    } catch (error) {
      console.error("Failed to purchase ticket:", error);
      alert(error.message || "Failed to purchase ticket. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Check if event is already purchased
  const isEventPurchased = (eventId) => {
    return purchasedTickets.some(ticket => ticket.eventId._id === eventId || ticket.eventId === eventId);
  };

  // Get purchased ticket for an event
  const getPurchasedTicket = (eventId) => {
    return purchasedTickets.find(ticket => ticket.eventId._id === eventId || ticket.eventId === eventId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">Tick it</h1>
          {address ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition flex items-center gap-2"
              >
                <Plus size={18} />
                Create Event
              </button>
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              Connect wallet to create events
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-slate-800 mb-8 overflow-x-auto">
          {["available", "purchased", "hosted"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab === "available" && "Available Events"}
              {tab === "purchased" && "My Tickets"}
              {tab === "hosted" && "Hosted Events"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "available" && (
          <div>
            {eventsError && (
              <ErrorState 
                message={`Failed to load events: ${eventsError}`}
                onRetry={fetchEvents}
              />
            )}
            {eventsLoading && <LoadingState />}
            {!eventsLoading && events.length === 0 && (
              <EmptyState message="No events available yet. Be the first to create one!" />
            )}
            {!eventsLoading && events.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.filter(e => e.hostAddress?.toLowerCase() !== address?.toLowerCase()).map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "purchased" && (
          <div>
            {ticketsError && (
              <ErrorState 
                message={`Failed to load tickets: ${ticketsError}`}
                onRetry={fetchPurchasedTickets}
              />
            )}
            {ticketsLoading && <LoadingState />}
            {!ticketsLoading && purchasedTickets.length === 0 && (
              <EmptyState message="You haven't purchased any tickets yet. Explore available events above!" />
            )}
            {!ticketsLoading && purchasedTickets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="cursor-pointer"
                  >
                    <EventCard
                      event={ticket.eventId}
                      isPurchased={true}
                      onClick={() => setSelectedTicket(ticket)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "hosted" && (
          <div>
            {eventsLoading && <LoadingState />}
            {!eventsLoading && hostedEvents.length === 0 && (
              <EmptyState message="You haven't created any events yet. Click 'Create Event' to get started!" />
            )}
            {!eventsLoading && hostedEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="relative"
                  >
                    <EventCard
                      event={event}
                      isHosted={true}
                      onClick={() => setAnalyticsEvent(event)}
                    />
                    <button
                      onClick={() => setAnalyticsEvent(event)}
                      className="absolute top-2 right-2 bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-md transition"
                      title="View Analytics"
                    >
                      <BarChart3 size={18} />
                    </button>
                  </div>
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

      {/* Event Details Modal (For Purchasing) */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onPurchase={() => handlePurchaseTicket(selectedEvent)}
          isPurchasing={isPurchasing}
          isPurchased={isEventPurchased(selectedEvent._id)}
          onViewTicket={() => {
            setSelectedEvent(null);
            setSelectedTicket(getPurchasedTicket(selectedEvent._id));
          }}
        />
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Analytics Modal */}
      {analyticsEvent && (
        <AnalyticsModal
          event={analyticsEvent}
          onClose={() => setAnalyticsEvent(null)}
        />
      )}
    </div>
  );
}