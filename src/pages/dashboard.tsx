import React, { useEffect, useState } from "react";
import { 
  Plus, Calendar, Share2, X, Ticket, DollarSign, 
  Lock, Unlock, AlertCircle, Loader2, Copy, Download, Eye,
  BarChart3, TrendingUp, Users, Upload, MapPin, Clock,
  Sparkles, Zap, Star, ChevronRight,
  LogOut,
} from "lucide-react";
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Warp, NeuroNoise } from '@paper-design/shaders-react';

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

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
  { value: "open", label: "Open", icon: Unlock },
  { value: "approval", label: "Approval Required", icon: Lock }
];

// Validation Helper
function validateEventForm(formData) {
  const errors: any = {};

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

// Enhanced Event Card Component with Modern Design
function EventCard({ event, onClick, isPurchased = false, isHosted = false }) {
  const availableSeats = getAvailableSeats(event);
  const isSoldOut = availableSeats <= 0;
  const occupancyRate = ((event.soldSeats / event.maxSeats) * 100).toFixed(0);
 

 function getRandomInRange(): number {
  const min = 0.35;
  const max = 0.70;
  return Math.random() * (max - min) + min;
} 

  return (
    <div
      onClick={onClick}
      className="group relative border border-slate-700/50 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 rounded-2xl overflow-hidden"
    >
        <NeuroNoise
            width="100%"
            height="100%"
            className={`absolute inset-0 -z-1 opacity-95`}
            colorFront="#ffffff"
            colorMid="#47a6ff"
            colorBack="#000000"
            brightness={0.17}
            contrast={0.35}
            speed={getRandomInRange()} 
            scale={getRandomInRange()} 
            rotation={getRandomInRange()}
        />

        {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Image with Overlay */}
      <div className="relative h-48 overflow-hidden">
        {event.banner || event.imageUrl ? (
          <>
            <img
              src={event.banner || event.imageUrl}
              alt={event.eventName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
              (e.target as HTMLElement).style.display = "none";              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
            <Calendar className="text-slate-600" size={56} />
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex gap-2">
            {event.permission === "open" ? (
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Unlock size={12} />
                Open
              </div>
            ) : (
              <div className="bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Lock size={12} />
                Approval
              </div>
            )}
            
            {event.ticketPrice === 0 && (
              <div className="bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles size={12} />
                Free
              </div>
            )}
          </div>
          
          {isPurchased && (
            <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              ✓ Owned
            </div>
          )}
          
          {isHosted && (
            <div className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              👤 Hosting
            </div>
          )}
        </div>
      </div>

      <div className="relative p-5 space-y-4">
        {/* Title */}
        <h3 className="font-bold text-xl text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
          {event.eventName}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar size={16} className="text-blue-400" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={16} className="text-blue-400" />
            <span>{formatTime(event.time)}</span>
          </div>
        </div>

        {/* Location */}
        {event.location && event.location !== "null" && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin size={16} className="text-blue-400 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Seats Progress Bar */}
        {!isPurchased && !isHosted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Availability</span>
              <span className={isSoldOut ? "text-red-400 font-semibold" : "text-slate-300 font-semibold"}>
                {availableSeats}/{event.maxSeats} seats
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut ? "bg-red-500" : Number(occupancyRate) > 80 ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          {event.ticketPrice > 0 ? (
            <div className="flex items-center gap-1">
              <DollarSign size={18} className="text-emerald-400" />
              <span className="text-lg font-bold text-emerald-400">{event.ticketPrice}</span>
              <span className="text-xs text-slate-400">APT</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-emerald-400">Free</span>
          )}
          
          <ChevronRight size={20} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && !isPurchased && !isHosted && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-red-500/20 border-2 border-red-500 rounded-xl px-6 py-3">
              <span className="text-xl font-bold text-red-400">SOLD OUT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="bg-slate-900/80 rounded-3xl overflow-hidden border border-slate-700/30 backdrop-blur-sm">
      {/* Image skeleton with shimmer effect */}
      <div className="relative h-56 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/20 to-transparent"></div>
        <div className="absolute top-4 left-4 w-20 h-9 bg-emerald-500/20 rounded-full overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6 space-y-5">
        {/* Title skeleton */}
        <div className="h-8 bg-slate-700/40 rounded-lg w-2/3 overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
        </div>
        
        {/* Date and time skeleton */}
        <div className="flex items-center gap-6">
          <div className="h-5 bg-slate-700/40 rounded w-32 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
          </div>
          <div className="h-5 bg-slate-700/40 rounded w-24 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
          </div>
        </div>
        
        {/* Location skeleton */}
        <div className="h-5 bg-slate-700/40 rounded w-20 overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
        </div>
        
        {/* Availability section */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-700/40 rounded w-24 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
            </div>
            <div className="h-4 bg-slate-700/40 rounded w-16 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
            </div>
          </div>
          <div className="h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/30 rounded-full w-3/5 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
            </div>
          </div>
        </div>
        
        {/* Price skeleton */}
        <div className="flex justify-between items-center pt-3">
          <div className="h-9 bg-slate-700/40 rounded-lg w-28 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
          </div>
          <div className="w-9 h-9 bg-slate-700/40 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Loading State
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-8">
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Navigation tabs skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-12 bg-blue-600/30 rounded-2xl w-48 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          </div>
          <div className="h-12 bg-slate-800/30 rounded-2xl w-36 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/20 to-transparent"></div>
          </div>
          <div className="h-12 bg-slate-800/30 rounded-2xl w-44 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-600/20 to-transparent"></div>
          </div>
        </div>
        
        {/* Cards grid - 3 cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Enhanced Empty State
function EmptyState({ message, icon: Icon = Calendar }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <Icon className="relative text-slate-600" size={64} />
      </div>
      <p className="text-xl text-slate-400 mb-2">{message}</p>
      <p className="text-sm text-slate-500">Start exploring or create your first event</p>
    </div>
  );
}

// Modern Error State
function ErrorState({ message, onRetry }) {
  return (
    <Alert className="bg-red-500/10 border-red-500/50">
      <AlertCircle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-400">
        {message}
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 underline hover:text-red-300"
          >
            Try Again
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Enhanced Create Event Form
function CreateEventForm({ formData, onInputChange, onSubmit, isLoading, errors }) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onInputChange({
          target: { name: 'banner', value: file, type: 'file' }
        });
        onInputChange({
          target: { name: 'bannerPreview', value: reader.result, type: 'text' }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    onInputChange({ target: { name: 'banner', value: null, type: 'file' } });
    onInputChange({ target: { name: 'bannerPreview', value: null, type: 'text' } });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Banner Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white">
          Event Banner
        </label>
        
        {formData.bannerPreview ? (
          <div className="relative group rounded-xl overflow-hidden border-2 border-slate-700">
            <img
              src={formData.bannerPreview}
              alt="Banner preview"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemoveBanner}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <X size={16} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-8 text-center transition-all duration-300 hover:bg-slate-800/50 group"
          >
            <Upload className="mx-auto mb-3 text-slate-500 group-hover:text-blue-400 transition-colors" size={32} />
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300">
              Click to upload banner image
            </p>
            <p className="text-xs text-slate-500 mt-2">
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

      {/* Event Name */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Event Name *</label>
        <input
          name="eventName"
          value={formData.eventName}
          onChange={onInputChange}
          placeholder="Enter an exciting event name"
          disabled={isLoading}
          className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none"
        />
        {errors.eventName && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.eventName}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Description *</label>
        <textarea
          name="eventDescription"
          value={formData.eventDescription}
          onChange={onInputChange}
          placeholder="Describe what makes your event special"
          disabled={isLoading}
          rows={4}
          className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none resize-none"
        />
        {errors.eventDescription && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.eventDescription}
          </p>
        )}
      </div>

      {/* Mode & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Mode *</label>
          <select
            name="mode"
            value={formData.mode}
            onChange={onInputChange}
            disabled={isLoading}
            className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white transition-colors focus:outline-none"
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={onInputChange}
            placeholder={formData.mode === "virtual" ? "Virtual" : "City, Country"}
            disabled={isLoading}
            className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onInputChange}
            disabled={isLoading}
            className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white transition-colors focus:outline-none"
          />
          {errors.date && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.date}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Time *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={onInputChange}
            disabled={isLoading}
            className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white transition-colors focus:outline-none"
          />
          {errors.time && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.time}
            </p>
          )}
        </div>
      </div>

      {/* Price & Seats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Ticket Price (APT) *</label>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={onInputChange}
            placeholder="0"
            min="0"
            step="0.01"
            disabled={isLoading}
            className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none"
          />
          {errors.ticketPrice && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.ticketPrice}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Max Seats *</label>
          <input
            type="number"
            name="maxSeats"
            value={formData.maxSeats}
            onChange={onInputChange}
            placeholder="1"
            min="1"
            disabled={isLoading}
            className="w-full bg-slate-800/50 border-2 border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 transition-colors focus:outline-none"
          />
          {errors.maxSeats && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.maxSeats}
            </p>
          )}
        </div>
      </div>

      {/* Permission */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Permission *</label>
        <div className="grid grid-cols-2 gap-3">
          {PERMISSIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onInputChange({ target: { name: 'permission', value } })}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                formData.permission === value
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Icon size={16} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Creating your event...
          </>
        ) : (
          <>
            <Zap size={20} />
            Create Event
          </>
        )}
      </button>
    </div>
  );
}

// Analytics Modal with Enhanced Design
function AnalyticsModal({ event, onClose }) {
  if (!event) return null;

  const availableSeats = getAvailableSeats(event);
  const occupancyRate = ((event.soldSeats / event.maxSeats) * 100).toFixed(1);
  const revenue = event.ticketPrice * event.soldSeats;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700 text-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-400" />
            Analytics Dashboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Title Card */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {event.eventName}
            </h3>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(event.time)}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tickets Sold */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/50 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <Ticket className="text-blue-400" size={28} />
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <TrendingUp className="text-blue-400" size={16} />
                </div>
              </div>
              <p className="text-sm text-blue-300 mb-1">Tickets Sold</p>
              <p className="text-4xl font-bold text-blue-400 mb-1">
                {event.soldSeats}
              </p>
              <p className="text-xs text-blue-300/70">
                of {event.maxSeats} total
              </p>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <Users className="text-emerald-400" size={28} />
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Star className="text-emerald-400" size={16} />
                </div>
              </div>
              <p className="text-sm text-emerald-300 mb-1">Occupancy</p>
              <p className="text-4xl font-bold text-emerald-400 mb-1">
                {occupancyRate}%
              </p>
              <p className="text-xs text-emerald-300/70">
                {availableSeats} remaining
              </p>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <DollarSign className="text-purple-400" size={28} />
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Zap className="text-purple-400" size={16} />
                </div>
              </div>
              <p className="text-sm text-purple-300 mb-1">Revenue</p>
              <p className="text-4xl font-bold text-purple-400 mb-1">
                {revenue.toFixed(2)}
              </p>
              <p className="text-xs text-purple-300/70">
                APT ../.. {event.ticketPrice}/ticket
              </p>
            </div>
          </div>

          {/* Availability Progress */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-sm font-semibold text-slate-300 mb-4">Seats Availability</p>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-slate-400">
              <span>0%</span>
              <span className="font-bold text-white">{occupancyRate}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-3">
            <h4 className="font-semibold text-white mb-4">Event Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Mode:</span>
                <span className="text-white capitalize font-medium">{event.mode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Permission:</span>
                <span className="text-white capitalize font-medium">{event.permission}</span>
              </div>
              {event.location && event.location !== "null" && (
                <>
                  <div className="flex justify-between text-sm col-span-2">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white font-medium">{event.location}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Created:</span>
                <span className="text-white font-medium">{formatDate(event.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ticket Details Modal
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700 text-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{event.eventName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Image */}
          {event.banner || event.imageUrl ? (
            <img
              src={event.banner || event.imageUrl}
              alt={event.eventName}
              className="w-full h-56 object-cover rounded-xl"
              onError={(e) => {
(e.target as HTMLElement).style.display = "none";              }}
            />
          ) : null}

          <p className="text-slate-300 leading-relaxed">{event.eventDescription}</p>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={16} className="text-blue-400" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={16} className="text-blue-400" />
              <span>{formatTime(event.time)}</span>
            </div>
          </div>

          {event.location && event.location !== "null" && (
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <MapPin size={16} className="text-blue-400" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Price Info */}
          {event.ticketPrice > 0 && (
            <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {event.ticketPrice} APT
              </p>
            </div>
          )}

          {/* Ticket Status */}
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-green-400 mb-1">✓ Ticket Confirmed</p>
            <p className="text-sm text-green-300">Valid: {ticket.valid ? 'Yes' : 'No'}</p>
          </div>

          {/* Participant Address */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Participant Address</p>
            <p className="font-mono text-xs text-slate-300 break-all">
              {ticket.participantAddress}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-300 mb-4">Scan QR Code</p>
            {ticket.qrCode && (
              <div className="bg-white p-4 rounded-xl">
                <img
                  src={ticket.qrCode}
                  alt="Ticket QR Code"
                  className="w-56 h-56"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadQR}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={copyQRToClipboard}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Copy size={18} />
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

// Event Details Modal (For Purchasing)
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700 text-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{event.eventName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {event.banner || event.imageUrl && (
            <img
              src={event.banner || event.imageUrl}
              alt={event.eventName}
              className="w-full h-56 object-cover rounded-xl"
              onError={(e) => {
(e.target as HTMLElement).style.display = "none";              }}
            />
          )}

          <p className="text-slate-300 leading-relaxed">{event.eventDescription}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={16} className="text-blue-400" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Ticket size={16} className="text-blue-400" />
              <span>{availableSeats} seats left</span>
            </div>
          </div>

          {event.location && event.location !== "null" && (
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <MapPin size={16} className="text-blue-400" />
              <span>{event.location}</span>
            </div>
          )}

          {event.ticketPrice > 0 && (
            <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {event.ticketPrice} APT
              </p>
              <p className="text-xs text-emerald-300 mt-1">per ticket</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {isPurchased ? (
              <button
                onClick={onViewTicket}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                View Ticket
              </button>
            ) : (
              <button
                onClick={onPurchase}
                disabled={isSoldOut || isPurchasing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Ticket size={18} />
                    {isSoldOut ? "Sold Out" : "Buy Ticket"}
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
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
  const navigate = useNavigate();
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
        // Normalize addresses before comparison
      const normalizeAddress = (addr) => {
        if (!addr) return '';
        let normalized = addr.trim();
        // Remove surrounding quotes
        normalized = normalized.replace(/^["']|["']$/g, '');
        // Remove 0x prefix
        normalized = normalized.toLowerCase().replace(/^0x/, '');
        return normalized;
      };

      const hosted = result.data.filter(e => 
        normalizeAddress(e.hostAddress) === normalizeAddress(address)
      );

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

  console.log("Current formData state:", {
    eventName: formData.eventName,
    banner: formData.banner,
    bannerType: typeof formData.banner,
    bannerInstanceof: formData.banner instanceof File,
    bannerPreview: formData.bannerPreview ? "exists" : "null",
  });

  const errors = validateEventForm(formData);
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setIsCreating(true);

  try {
    const formDataToSend = new FormData();

    const cleanAddress = address.trim().replace(/^["']|["']$/g, "");

    /* ---------------- FIX: ENSURE REAL FILE ---------------- */
    let bannerFile: File | null = null;

    if (formData.banner instanceof File) {
      bannerFile = formData.banner;
    } else if (formData.bannerPreview) {
      // Convert blob URL → File (fallback fix)
      const blob = await fetch(formData.bannerPreview).then(res => res.blob());
      bannerFile = new File([blob], "banner.jpg", { type: blob.type });
    }

    if (!bannerFile) {
      alert("Please upload a banner image");
      setIsCreating(false);
      return;
    }

    formDataToSend.append("banner", bannerFile);
    console.log("Banner attached:", bannerFile.name, bannerFile.size);

    /* ---------------- REQUIRED FIELDS ---------------- */
    formDataToSend.append("hostAddress", cleanAddress);
    formDataToSend.append("eventName", formData.eventName.trim());
    formDataToSend.append("eventDescription", formData.eventDescription.trim());
    formDataToSend.append("mode", formData.mode);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("time", formData.time);
    formDataToSend.append("location", formData.location?.trim() || "Virtual");
    formDataToSend.append("ticketPrice", String(Number(formData.ticketPrice)));
    formDataToSend.append("permission", formData.permission);
    formDataToSend.append("maxSeats", String(Number(formData.maxSeats)));
    formDataToSend.append("soldSeats", "0");
    formDataToSend.append(
      "eventBlockchainId",
      `event_${Date.now()}_${Math.random().toString(36).slice(2)}`
    );

    const response = await fetch(`${BACKEND_URL}/api/events`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formDataToSend,
    });

    const result = await response.json();
    console.log("Create event response:", result);

    if (response.ok && result.success !== false) {
      await fetchEvents();
      setFormData(INITIAL_FORM_STATE);
      setFormErrors({});
      setSidebarOpen(false);
      alert("🎉 Event created successfully!");
    } else {
      throw new Error(result.message || "Event creation failed");
    }
  } catch (error: any) {
    console.error("Create event error:", error);
    alert(error.message || "Something went wrong");
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
        alert(`🎉 Successfully purchased ticket for "${event.eventName}"!`);
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

  const isEventPurchased = (eventId) => {
    return purchasedTickets.some(ticket => ticket.eventId._id === eventId || ticket.eventId === eventId);
  };

  const getPurchasedTicket = (eventId) => {
    return purchasedTickets.find(ticket => ticket.eventId._id === eventId || ticket.eventId === eventId);
  };

  return (
    <div className="min-h-screen overflow-hidden relative text-white">
      

        <Warp className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          colors={["#14120f", "#d2a76a", "#dfc5a9", "#0b0b0b"]}
          proportion={0.24}
          softness={1}
          distortion={0.21}
          swirl={0.57}
          swirlIterations={10}
          shape="edge"
          shapeScale={0.75}
          speed={4.2}
          scale={2}
        />

      {/* Enhanced Navbar */}
      <nav className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
              <img src="/favicon.png" className={`w-16`} alt={`logo`}/>
            <h1 className="text-3xl font-black bg-slate-300 bg-clip-text text-transparent select-none">
              Tick it
            </h1>
          </div>
          {address ? (
            <div className="flex items-center gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 select-none">
                <span className="text-sm text-slate-300 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                <Plus size={20} />
                Create Event
              </button>

                <button
                    onClick={async () => {
                        try {


                            // 2️⃣ Remove auth data
                            localStorage.removeItem("token");
                            localStorage.removeItem("address");

                            toast.success("Logged out successfully");

                            // optional redirect / state reset
                            navigate("/", { replace: true });
                        } catch (err) {
                            console.error("Logout failed:", err);
                            toast.error("Logout failed");
                        }
                    }}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                >
                    <LogOut size={16} className="inline mr-2" />
                    Logout
                </button>
            </div>
          ) : (
            <div className="text-sm text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
              Connect wallet to create events
            </div>
          )}

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
          {[
            { key: "available", label: "Available Events", icon: Calendar },
            { key: "purchased", label: "My Tickets", icon: Ticket },
            { key: "hosted", label: "Hosted Events", icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap rounded-lg ${
                activeTab === key
                  ? "bg-[#a68353] text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              <Icon size={18} />
              {label}
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
              <EmptyState message="No events available yet" icon={Calendar} />
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
              <EmptyState message="No tickets purchased yet" icon={Ticket} />
            )}
            {!ticketsLoading && purchasedTickets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedTickets.map((ticket) => (
                  <EventCard
                    key={ticket._id}
                    event={ticket.eventId}
                    isPurchased={true}
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "hosted" && (
          <div>
            {eventsLoading && <LoadingState />}
            {!eventsLoading && hostedEvents.length === 0 && (
              <EmptyState message="No events hosted yet" icon={Users} />
            )}
            {!eventsLoading && hostedEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostedEvents.map((event) => (
                  <div key={event._id} className="relative">
                    <EventCard
                      event={event}
                      isHosted={true}
                      onClick={() => setAnalyticsEvent(event)}
                    />
                    <button
                      onClick={() => setAnalyticsEvent(event)}
                      className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg transition-all hover:scale-110 shadow-lg"
                      title="View Analytics"
                    >
                      <BarChart3 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Enhanced Create Event Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-l border-slate-700 overflow-y-auto z-50 shadow-2xl">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Sparkles size={28} className="text-blue-400" />
                Create Event
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <CreateEventForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleCreateEvent}
                isLoading={isCreating}
                errors={formErrors}
              />
            </div>
          </div>
        </>
      )}

      {/* Modals */}
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

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {analyticsEvent && (
        <AnalyticsModal
          event={analyticsEvent}
          onClose={() => setAnalyticsEvent(null)}
        />
      )}
    </div>
  );
}