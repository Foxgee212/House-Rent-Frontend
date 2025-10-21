import React, { useState, useEffect } from "react";
import { MapPin, Home, Info, Wallet, BedDouble, Bath, Ruler } from "lucide-react";

export default function HouseCard({ house }) {
  const [zoomed, setZoomed] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price || 0);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="bg-white/95 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
      hover:shadow-2xl hover:scale-[1.03] transition-transform duration-300 cursor-pointer border border-gray-100 relative group">

      {/* House Image */}
      <div className="relative">
        <img
          src={house.image || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={house.title || "House image"}
          onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
          className="w-full h-52 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rent Badge */}
        <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Home size={14} /> Rent
        </div>

        {/* Availability */}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md
          ${house.available ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"}`}>
          {house.available ? "Available" : "Occupied"}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl flex flex-col justify-center items-center text-white p-4 gap-2">
          {house.rooms && <div className="flex items-center gap-1 text-sm font-medium"><BedDouble size={16} /> {house.rooms} Rooms</div>}
          {house.baths && <div className="flex items-center gap-1 text-sm font-medium"><Bath size={16} /> {house.baths} Baths</div>}
          {house.area && <div className="flex items-center gap-1 text-sm font-medium"><Ruler size={16} /> {house.area} sqft</div>}
        </div>
      </div>

      {/* House Details */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Info size={18} className="text-blue-600" /> {house.title || "Untitled House"}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
          <MapPin size={16} className="text-blue-500" />
          <span className="truncate">{house.location || "Unknown location"}</span>
        </div>

        <p className="text-blue-700 dark:text-blue-400 font-bold mt-3 flex items-center gap-1">
          <Wallet size={18} /> {formatPrice(house.price)} 
          <span className="text-gray-500 text-sm">/month</span>
        </p>

        {house.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
            {house.description}
          </p>
        )}
      </div>

      {/* Zoomed Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => setZoomed(false)}
        >
          <img
            src={house.image || "https://via.placeholder.com/800x500?text=No+Image"}
            alt={house.title || "Zoomed house image"}
            className="max-w-[90%] max-h-[90%] rounded-2xl shadow-2xl border-4 border-white/20 transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
