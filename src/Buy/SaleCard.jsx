import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Info,
  Wallet,
  X,
  BadgeDollarSign,
  BedDouble,
  Bath,
  Toilet,
  Car,
  Star,
  Heart,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// NaijaHome watermark SVG
const NaijahomeLogoSVG = ({ width = 180, height = 55 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 300 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 0.15 }}
  >
    <path d="M20 40 L40 20 L60 40 V70 H20 V40 Z" fill="url(#grad1)" />
    <path d="M40 70 V50 H50 V70 H40 Z" fill="#fff" />
    <text
      x="70"
      y="55"
      fontFamily="Poppins, sans-serif"
      fontWeight="700"
      fontSize="30"
      fill="url(#grad1)"
    >
      Naijahome
    </text>
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="100%" y2="0">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
  </svg>
);

// Canvas image component with watermark and right-click protection
function ProtectedWatermarkedImage({ src, alt, className, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const svgData = `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.15">
            <path d="M20 40 L40 20 L60 40 V70 H20 V40 Z" fill="url(#grad1)" />
            <path d="M40 70 V50 H50 V70 H40 Z" fill="#fff" />
            <text x="70" y="55" font-family="Poppins, sans-serif" font-weight="700" font-size="30" fill="url(#grad1)">
              Naijahome
            </text>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stop-color="#3B82F6"/>
                <stop offset="100%" stop-color="#2563EB"/>
              </linearGradient>
            </defs>
          </g>
        </svg>
      `;
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const svgImg = new Image();
      svgImg.src = url;
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
      };
    };
  }, [src]);

  const handleRightClick = (e) => {
    e.preventDefault();
    toast.error("❌ Sorry, you can't download this image!");
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      alt={alt}
      onClick={onClick}
      onContextMenu={handleRightClick}
    />
  );
}

export default function SaleCard({ house }) {
  const [zoomed, setZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const images = Array.isArray(house.images) ? house.images : [];

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(house.price || 0);
  }, [house.price]);

  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
    if (house.id && savedList.includes(house.id)) setSaved(true);
  }, [house.id]);

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

  return (
    <div className="relative bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 border border-gray-800 cursor-pointer">
      {/* Image Section */}
      <div className="relative group">
        <ProtectedWatermarkedImage
          src={house.primaryImage || images[0] || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={house.title || "House image"}
          className="w-full h-48 sm:h-60 object-cover transition-transform duration-500 hover:scale-105"
          onClick={() => setZoomed(true)}
        />


        {/* Sale Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <BadgeDollarSign size={12} /> For Sale
        </div>

        {/* Availability Badge */}
        <div
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
            house.available ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {house.available ? "Available" : "Sold"}
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
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 text-gray-100">
        <h3 className="text-base sm:text-lg font-semibold mb-1 flex items-center gap-2">
          <Info size={16} className="text-blue-400" /> {house.title || "Untitled Property"}
        </h3>
        <div className="flex items-center gap-1 text-gray-300 text-sm mb-2">
          <MapPin size={14} className="text-blue-400" />
          <span className="truncate">{house.location || "Unknown location"}</span>
        </div>
        <p className="text-blue-400 font-bold flex items-center gap-1 text-base sm:text-lg">
          <Wallet size={16} /> {formattedPrice}
          {house.period && (
            <span className="text-gray-300 text-xs sm:text-sm font-medium">/{house.period}</span>
          )}
        </p>
      </div>

      {/* Footer Info */}
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
          <li
            className="flex items-center gap-1 cursor-pointer"
            onClick={(e) => toggleSave(e)}
            title={saved ? "Remove from favorites" : "Save property"}
          >
            <Heart
              size={14}
              className={`transition ${saved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`}
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

      {/* Zoom Modal with Slider */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            key="zoom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 overflow-auto"
            onClick={() => setZoomed(false)}
          >
            <motion.button
              onClick={() => setZoomed(false)}
              className="absolute top-5 right-5 bg-gray-700 text-white rounded-full p-2 shadow-md hover:bg-gray-600 transition"
            >
              <X size={20} />
            </motion.button>

            <div className="relative max-w-[90%] max-h-[70vh]">
              <ProtectedWatermarkedImage
  src={house.primaryImage || images[activeIndex] || "https://via.placeholder.com/800x500?text=No+Image"}
  alt={`House ${activeIndex + 1}`}
  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-gray-700 transition-transform duration-300"
  onClick={(e) => e.stopPropagation()}
/>

              {/* Prev Arrow */}
              {images.length > 1 && activeIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev - 1); }}
                  className="absolute top-1/2 left-3 -translate-y-1/2 bg-gray-700/70 text-white p-2 rounded-full hover:bg-gray-600 transition"
                >
                  ◀
                </button>
              )}

              {/* Next Arrow */}
              {images.length > 1 && activeIndex < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev + 1); }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 bg-gray-700/70 text-white p-2 rounded-full hover:bg-gray-600 transition"
                >
                  ▶
                </button>
              )}
            </div>

            {/* Thumbnail Selector */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap justify-center mt-4" onClick={e => e.stopPropagation()}>
                {images.map((img, index) => (
                  <ProtectedWatermarkedImage
                    key={index}
                    src={img}
                    alt={`House ${index + 1}`}
                    className={`w-16 h-12 sm:w-20 sm:h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                      activeIndex === index ? "border-blue-400 scale-105" : "border-transparent hover:opacity-80"
                    }`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
