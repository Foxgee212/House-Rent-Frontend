import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  User,
  Home,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  BedDouble,
  Bath,
  Toilet,
  Car,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useHouses } from "../context/HouseContext";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   Smart Price Parser + Formatter (GLOBAL)
========================================================= */
export function formatPrice(amount) {
  if (!amount) return "₦0";
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount}`;
}

export function parseUserInput(input, unit = "M") {
  const amount = parseFloat(input);
  if (isNaN(amount)) return 0;

  switch (unit.toUpperCase()) {
    case "B": return amount * 1_000_000_000;
    case "M": return amount * 1_000_000;
    case "K": return amount * 1_000;
    default: return amount;
  }
}


export default function HouseDetail() {
  const { id } = useParams();
  const { houses } = useHouses();
  const { user } = useAuth();

  const [house, setHouse] = useState(null);
  const [recommendedHouses, setRecommendedHouses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    const found = houses.find((h) => h._id === id);
    if (found) {
      setHouse(found);
      setSelectedImage(found.images?.[0]);
    }
    return () => clearTimeout(timer);
  }, [id, houses]);

  useEffect(() => {
    if (!house) return;
    const priceRange = 0.2;
    const recs = houses.filter((h) => {
      if (h._id === house._id) return false;
      const locationMatch =
        h.location &&
        house.location &&
        h.location.split(",")[0] === house.location.split(",")[0];
      const min = house.price * (1 - priceRange);
      const max = house.price * (1 + priceRange);
      const priceMatch = h.price >= min && h.price <= max;
      return locationMatch && priceMatch;
    });
    setRecommendedHouses(recs.slice(0, 5));
  }, [house, houses]);

  const message = `Hello, I am interested in your ${house?.title || ""} located in ${house?.location || ""}. Is it still available?`;

  const handleWhatsAppContact = () => {
    const formattedPhone = house.landlord.phone.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, "_blank");
  };

  const handleImageClick = (img, index) => {
    setSelectedImage(img);
    setZoomIndex(index);
  };

  const openZoom = (index) => {
    setZoomIndex(index);
    setZoomOpen(true);
  };

  const nextImage = () => {
    const nextIndex = (zoomIndex + 1) % (house?.images?.length || 1);
    setZoomIndex(nextIndex);
    setSelectedImage(house.images?.[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (zoomIndex - 1 + (house?.images?.length || 1)) % (house?.images?.length || 1);
    setZoomIndex(prevIndex);
    setSelectedImage(house.images?.[prevIndex]);
  };

  if (loading || !house) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-12 animate-pulse">
        <div className="h-72 bg-gray-700 rounded-2xl mb-4"></div>
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-16">
      {/* Card Wrapper */}
      <div className="px-4 sm:px-6 mt-6 flex justify-center">
        <div className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-700">
          {/* Header Image */}
          <div className="relative w-full">
            <img
              key={selectedImage}
              src={selectedImage || house.images?.[0]}
              alt={house.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer"
              onClick={() => openZoom(zoomIndex)}
              onContextMenu={(e) => e.preventDefault()}
            />
            <span
              className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${
                house.available
                  ? "bg-green-600 text-white border border-green-500"
                  : "bg-red-600 text-white border border-red-500"
              }`}
            >
              {house.available ? "Available" : "Occupied"}
            </span>
          </div>

          {/* Thumbnails */}
          <div className="flex overflow-x-auto gap-2 px-3 py-3 bg-gray-800">
            {house.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Thumbnail ${i}`}
                className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                  selectedImage === img ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => handleImageClick(img, i)}
                onContextMenu={(e) => e.preventDefault()}
              />
            ))}
          </div>

          {/* Content Section */}
          <div className="px-6 py-5 space-y-6">
            {/* Title & Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Home size={22} className="text-blue-400" /> {house.title}
              </h1>
              <p className="flex items-center gap-2 mt-2 text-gray-300">
                <MapPin size={16} className="text-blue-400" /> {house.location}
              </p>
              <p className="text-green-400 font-bold text-xl mt-3 flex items-center gap-2">
                <Wallet size={18} /> {formatPrice(house.price)}
                {house.priceUnit && (
                          <span className="text-gray-400 text-sm font-medium">/{house.priceUnit}</span>
                        )}
              </p>
            </div>
            {/* Property Stats */}
            <div className="mt-4 flex items-center justify-between text-gray-300 text-sm">
              <span className="flex items-center gap-1" title="Rooms">
                <BedDouble size={14} className="text-blue-400" /> {house.rooms || 0}
              </span>
              <span className="flex items-center gap-1" title="Bathrooms">
                <Bath size={14} className="text-blue-400" /> {house.baths || 0}
              </span>
              <span className="flex items-center gap-1" title="Toilets">
                <Toilet size={14} className="text-blue-400" /> {house.toilets || 0}
              </span>
              <span className="flex items-center gap-1" title="Parking">
                <Car size={14} className="text-blue-400" /> {house.parking || 0}
              </span>
            </div>

            {/* Description */}
            {house.description && (
              <p className="text-gray-300 leading-relaxed text-[15px]">{house.description}</p>
            )}

            {/* Landlord Card */}
            {house.landlord && (
              <div className="bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md border border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <User size={20} className="text-blue-400" /> Landlord Info
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
                  {/* Profile */}
                  <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                    <img
                      src={
                        house.landlord?.profilePic ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          house.landlord?.name || "User"
                        )}&background=0D8ABC&color=fff`
                      }
                      alt="Seller"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 rounded-full ring-2 ring-gray-900"></span>
                  </div>

                  {/* Info */}
                  <div className="mt-3 sm:mt-0 text-center sm:text-left flex-1 space-y-1">
                    <p className="text-base sm:text-lg font-semibold text-white">{house.landlord.name}</p>
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-300 text-sm sm:text-base truncate">
                      <Mail size={14} className="text-blue-400" /> {house.landlord.email || "No Email"}
                    </p>
                    <p className="flex items-center justify-center sm:justify-start gap-2 text-gray-300 text-sm sm:text-base truncate">
                      <Phone size={14} className="text-blue-400" /> {house.landlord.phone || "No Phone"}
                    </p>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 mt-5">
                  {house.landlord?.phone && (
                    <a
                      href={`tel:${house.landlord.phone}`}
                      className="flex items-center justify-center gap-2 bg-white text-blue-700 text-sm sm:text-sm px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition min-w-[120px]"
                    >
                      <Phone size={16} /> Call
                    </a>
                  )}
                  {house.landlord?.phone && (
                    <a
                      href={`https://wa.me/${house.landlord.phone}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm sm:text-sm px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition min-w-[120px]"
                    >
                      <FaWhatsapp size={16} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Recommended */}
            {recommendedHouses.length > 0 && (
              <div className="px-6 py-5">
                <h2 className="text-lg sm:text-xl font-bold mb-3 text-white">Recommended for You</h2>
                <div className="flex gap-3 overflow-x-auto pb-3">
                  {recommendedHouses.map((h) => (
                    <div
                      key={h._id}
                      className="min-w-[200px] bg-gray-800 shadow-md rounded-xl p-3 flex-shrink-0 relative border border-gray-700"
                    >
                      <img
                        src={h.primaryImage || h.images?.[0]}
                        alt={h.title}
                        className="w-full h-32 object-cover rounded-lg"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      <span
                        className={`absolute top-2 right-2 px-3 py-0.5 text-xs rounded-full font-semibold ${
                          h.available
                            ? "bg-green-600 text-white border border-green-500"
                            : "bg-red-600 text-white border border-red-500"
                        }`}
                      >
                        {h.available ? "Available" : "Occupied"}
                      </span>
                      <h3 className="mt-2 font-semibold text-white">{h.title}</h3>
                      <p className="text-gray-300 text-sm">{h.location}</p>
                      <p className="mt-1 font-semibold text-green-400">
                        ₦{formatPrice(h.price)}
                        {h.period && (
                          <span className="text-gray-400 text-sm font-medium">/{h.period}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            className="absolute top-6 right-6 text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
            onClick={() => setZoomOpen(false)}
          >
            <X size={24} />
          </button>

          <div className="flex items-center justify-center w-full h-full px-6">
            <button
              className="text-white p-3 rounded-full hover:bg-gray-800"
              onClick={prevImage}
            >
              <ChevronLeft size={32} />
            </button>

            <img
              src={house.images?.[zoomIndex]}
              alt="Zoomed"
              className="max-h-[90vh] max-w-full object-contain rounded-xl"
              onContextMenu={(e) => e.preventDefault()}
            />

            <button
              className="text-white p-3 rounded-full hover:bg-gray-800"
              onClick={nextImage}
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
