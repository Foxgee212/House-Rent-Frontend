import React, { useState, useEffect } from "react";
import {
  MapPin,
  Home,
  Info,
  Wallet,
  BedDouble,
  Bath,
  Ruler,
  X,
} from "lucide-react";

export default function HouseCard({ house }) {
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
    <div
      className="dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
      hover:shadow-2xl hover:scale-[1.03] transition-transform duration-300 cursor-pointer border border-gray-100 relative group"
    >
      {/* House Image */}
      <div className="relative">
        <img
          src={images[0] || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={house.title || "House image"}
          onClick={(e) => {
            e.stopPropagation();
            setZoomed(true);
            setActiveIndex(0);
          }}
          className="w-full h-40 sm:h-52 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rent Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-600/90 text-white text-xs sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md flex items-center gap-1">
          <Home size={12} /> Rent
        </div>

        {/* Availability */}
        <div
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 text-xs sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md
          ${house.available ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"}`}
        >
          {house.available ? "Available" : "Occupied"}
        </div>

        {/* Negotiable Flag */}
        {house.negotiable !== undefined && (
          <div
            className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md border
              ${
                house.negotiable
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-gray-200 text-gray-700 border-gray-300"
              }`}
          >
            {house.negotiable ? "Negotiable" : "Fixed Price"}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl flex flex-col justify-center items-center text-white p-2 sm:p-4 gap-1 sm:gap-2 text-xs sm:text-sm">
          {house.rooms && (
            <div className="flex items-center gap-1">
              <BedDouble size={14} /> {house.rooms} Rooms
            </div>
          )}
          {house.baths && (
            <div className="flex items-center gap-1">
              <Bath size={14} /> {house.baths} Baths
            </div>
          )}
          {house.area && (
            <div className="flex items-center gap-1">
              <Ruler size={14} /> {house.area} sqft
            </div>
          )}
        </div>
      </div>

      {/* House Details */}
      <div className="p-3 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Info size={16} className="text-blue-600" /> {house.title || "Untitled House"}
        </h3>

        <div className="flex items-center gap-1 sm:gap-2 mt-1 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          <MapPin size={14} className="text-blue-500" />
          <span className="truncate">{house.location || "Unknown location"}</span>
        </div>

        <p className="text-blue-400 font-bold mt-2 sm:mt-3 flex items-center gap-1 text-sm sm:text-base">
          <Wallet size={16} /> {formatPrice(house.price)}
          <span className="text-gray-500 text-xs sm:text-sm">/month</span>
        </p>

        {house.description && (
          <p className="text-xs sm:text-sm text-gray-300 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {house.description}
          </p>
        )}
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
            src={images[activeIndex] || "https://via.placeholder.com/800x500?text=No+Image"}
            alt={house.title || "Zoomed house image"}
            className="max-w-[90%] max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white/20 transition-transform duration-300 mb-4"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex gap-2 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`House ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`w-16 h-12 sm:w-20 sm:h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                  activeIndex === index ? "border-blue-500 scale-105" : "border-transparent hover:opacity-80"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
