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
  Phone,
  CalendarDays,
  Star,
  Heart,
  Toilet,
  Car,
} from "lucide-react";

export default function HouseCard({ house }) {
  const [zoomed, setZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price || 0);

  // Load saved state from localStorage
  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
    if (house.id && savedList.includes(house.id)) setSaved(true);
  }, [house.id]);

  // Toggle save/favorite
  const toggleSave = (e) => {
    e.stopPropagation();
    const savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
    let updated;
    if (saved) {
      updated = savedList.filter((id) => id !== house.id);
      setSaved(false);
    } else {
      updated = [...savedList, house.id];
      setSaved(true);
    }
    localStorage.setItem("savedProperties", JSON.stringify(updated));
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const images = Array.isArray(house.images) ? house.images : [];

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 border border-gray-800 cursor-pointer">
      
      {/* Premium Ribbon */}
      {house.premium && (
        <div className="absolute top-3 left-[-40px] bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-semibold py-1 px-12 rotate-[-45deg] shadow-md">
          Premium
        </div>
      )}

      {/* Image Section */}
      <div className="relative group">
        <img
          src={images[0] || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={house.title || "House image"}
          onClick={() => setZoomed(true)}
          className="w-full h-48 sm:h-60 object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rent Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Home size={13} /> {house.type || "Rent"}
        </div>

        {/* Availability */}
        <div
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
            house.available ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {house.available ? "Available" : "Occupied"}
        </div>

        {/* Negotiable / Fixed Price */}
        {house.negotiable !== undefined && (
          <div
            className={`absolute bottom-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md border ${
              house.negotiable
                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                : "bg-gray-700 text-gray-200 border-gray-600"
            }`}
          >
            {house.negotiable ? "Negotiable" : "Fixed Price"}
          </div>
        )}

        {/* Image Count */}
        {images.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <i className="fal fa-camera"></i> {images.length} Photos
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 text-gray-100">
        <h3 className="text-base sm:text-lg font-semibold mb-1 flex items-center gap-2">
          <Info size={16} className="text-blue-400" />
          {house.title || "Untitled House"}
        </h3>

        <div className="flex items-center gap-1 text-gray-300 text-sm mb-2">
          <MapPin size={14} className="text-blue-400" />
          <span className="truncate">{house.location || "Unknown location"}</span>
        </div>

        {house.description && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-3">
            {house.description}
          </p>
        )}

        {/* Price */}
        <p className="text-blue-400 font-bold flex items-center gap-1 text-base sm:text-lg">
          <Wallet size={16} /> {formatPrice(house.price)}
          {house.period && (
            <span className="text-gray-300 text-xs sm:text-sm font-medium">
              /{house.period}
            </span>
          )}
        </p>

        {/* Meta Info */}
        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-3">
            {house.rooms && (
              <span className="flex items-center gap-1">
                <BedDouble size={14} /> {house.rooms}
              </span>
            )}
            {house.baths && (
              <span className="flex items-center gap-1">
                <Bath size={14} /> {house.baths}
              </span>
            )}
            {house.area && (
              <span className="flex items-center gap-1">
                <Ruler size={14} /> {house.area} sqft
              </span>
            )}
          </div>
          {house.added && (
            <span className="flex items-center gap-1">
              <CalendarDays size={13} /> {house.added}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 overflow-x-auto">
        <ul className="flex flex-nowrap justify-between sm:justify-around gap-4 text-xs sm:text-sm text-gray-300 min-w-max sm:min-w-0">
          {[ 
            { icon: <BedDouble size={14} />, value: house.rooms },
            { icon: <Bath size={14} />, value: house.baths },
            { icon: <Toilet size={14} />, value: house.toilets },
            { icon: <Car size={14} />, value: house.parking },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-1 whitespace-nowrap">
              {item.icon} {item.value || 0}
            </li>
          ))}

          {/* Save / Favorite */}
          <li
            className="flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(e);
            }}
            title={saved ? "Remove from favorites" : "Save property"}
          >
            <Heart
              size={14}
              className={`transition ${
                saved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
            />
          </li>
        </ul>
      </div>

      {/* Agent Footer */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between text-sm text-gray-300 border-t border-gray-700">
        <div className="flex items-center gap-1 font-medium">
          <Star size={13} className="text-yellow-500" /> {house.agent || "NaijaHome Agent"}
        </div>
        {house.phone && (
          <div className="flex items-center gap-1 font-semibold text-blue-400">
            <Phone size={14} /> {house.phone}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-5 right-5 bg-gray-700 text-white rounded-full p-2 shadow-md hover:bg-gray-600 transition"
          >
            <X size={20} />
          </button>

          <img
            src={images[activeIndex] || "https://via.placeholder.com/800x500?text=No+Image"}
            alt="Zoomed house image"
            className="max-w-[90%] max-h-[70vh] rounded-2xl shadow-2xl border-4 border-gray-700 transition-transform duration-300 mb-4"
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
                  activeIndex === index ? "border-blue-400 scale-105" : "border-transparent hover:opacity-80"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
