import React, { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  Info,
  Wallet,
  BedDouble,
  Bath,
  Ruler,
  User,
  Mail,
  Phone,
  Trash2,
  CheckCircle,
  X,
} from "lucide-react";

export default function AdminHouseCard({ house, onApprove, onDelete }) {
  const [zoomed, setZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price || 0);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const images = Array.isArray(house.images) ? house.images : [];

  return (
    <div className="bg-white/95 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.03] transition-transform duration-300 border border-gray-100 relative group">
      {/* House Image */}
      <div className="relative">
        <img
          src={images[0] || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={house.title || "House image"}
          onClick={() => setZoomed(true)}
          className="w-full h-52 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105 cursor-pointer"
        />

        {/* Rent Badge */}
        <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Home size={14} /> Rent
        </div>

        {/* Availability Badge */}
        <div
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
            house.available ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"
          }`}
        >
          {house.available ? "Available" : "Occupied"}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl flex flex-col justify-center items-center text-white p-4 gap-2">
          {house.rooms && (
            <div className="flex items-center gap-1 text-sm font-medium">
              <BedDouble size={16} /> {house.rooms} Rooms
            </div>
          )}
          {house.baths && (
            <div className="flex items-center gap-1 text-sm font-medium">
              <Bath size={16} /> {house.baths} Baths
            </div>
          )}
          {house.area && (
            <div className="flex items-center gap-1 text-sm font-medium">
              <Ruler size={16} /> {house.area} sqft
            </div>
          )}
        </div>
      </div>

      {/* House Details */}
      <div className="p-5 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Info size={18} className="text-blue-600" /> {house.title || "Untitled House"}
        </h3>

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <MapPin size={16} className="text-blue-500" />
          <span className="truncate">{house.location || "Unknown location"}</span>
        </div>

        <p className="text-blue-700 dark:text-blue-400 font-bold mt-3 flex items-center gap-1">
          <Wallet size={18} /> {formatPrice(house.price)}
          <span className="text-gray-500 text-sm">/month</span>
        </p>

        {/* Status */}
        <p
          className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
            house.status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {house.status === "approved" ? "Approved" : "Pending"}
        </p>

        {/* Landlord Info */}
        {house.landlord && (
          <div className="mt-3 border-t pt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div className="flex items-center gap-1">
              <User size={15} className="text-blue-500" /> {house.landlord.name || "No name"}
            </div>
            <div className="flex items-center gap-1">
              <Mail size={15} className="text-blue-500" /> {house.landlord.email || "No email"}
            </div>
            {house.landlord.phone && (
              <div className="flex items-center gap-1">
                <Phone size={15} className="text-blue-500" /> {house.landlord.phone}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onApprove(house._id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
            house.status === "approved"
              ? "bg-green-600 cursor-not-allowed opacity-70"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={house.status === "approved"}
        >
          <CheckCircle size={16} /> {house.status === "approved" ? "Approved" : "Approve"}
        </button>

        <button
          onClick={() => onDelete(house._id)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* Zoom Modal with Carousel */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-5 right-5 bg-white/80 text-black rounded-full p-2 shadow-md hover:bg-white transition"
          >
            <X size={20} />
          </button>

          <img
            src={images[activeIndex] || images[0] || "https://via.placeholder.com/800x500?text=No+Image"}
            alt={house.title || "Zoomed house image"}
            className="max-w-[90%] max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white/20 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap justify-center mt-4" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`House ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-20 h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                    idx === activeIndex ? "border-blue-500 scale-105" : "border-transparent hover:opacity-80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
