import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Toilet,
  Car,
  Ruler,
  Home,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function BuyDetail() {
  const { id } = useParams();
  const { housesForSale } = useHouses();
  const house = housesForSale.find((h) => h._id === id);

  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const firstImage = useMemo(() => house?.images?.[0] || "/default-house.jpg", [house]);

  const message = useMemo(
    () => `Hello, I'm interested in purchasing your property located in ${house?.location}. Is it still available?`,
    [house?.location]
  );

  useEffect(() => {
    if (house) setSelectedImage(house.images?.[0]);
  }, [house]);

  const handleImageClick = (img, index) => {
    setSelectedImage(img);
    setZoomIndex(index);
  };

  const openZoom = (index) => {
    setZoomIndex(index);
    setZoomOpen(true);
  };

  const nextImage = () => {
    setZoomIndex((prev) => (prev + 1) % (house?.images?.length || 1));
  };

  const prevImage = () => {
    setZoomIndex((prev) =>
      (prev - 1 + (house?.images?.length || 1)) % (house?.images?.length || 1)
    );
  };

  if (!house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Home className="w-10 h-10 text-blue-400 animate-pulse" />
        <p className="mt-3 text-gray-400">Property not found.</p>
        <Link to="/buy" className="mt-4 text-blue-500 hover:text-blue-400">
          Go Back
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    location,
    price,
    bedrooms,
    bathrooms,
    images,
    toilets,
    parking,
    size,
  } = house;

  const recommendedHouses = housesForSale.filter((h) => h._id !== id).slice(0, 4);

  return (
    <motion.div className="min-h-screen bg-gray-900 pb-16 transition-all duration-500">
      {/* Header Image */}
      <div className="px-4 sm:px-6 mt-6 flex justify-center">
        <div className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-700">
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>}
            <motion.img
              key={selectedImage}
              src={selectedImage || firstImage}
              alt={title || "Property Image"}
              onLoad={() => setImageLoaded(true)}
              onClick={() => openZoom(zoomIndex)}
              className="w-full h-full object-cover cursor-pointer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute top-5 left-5 z-20">
              <Link
                to="/buy"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm sm:text-base text-white backdrop-blur-md border border-white/20"
              >
                <ArrowLeft size={16} /> Back
              </Link>
            </div>
            <motion.span
              className={`absolute top-5 right-5 px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${
                house.available
                  ? "bg-green-600 text-white border border-green-500"
                  : "bg-red-600 text-white border border-red-500"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {house.available ? "Available" : "Sold"}
            </motion.span>
          </div>

          {/* Thumbnails */}
          {images?.length > 1 && (
            <motion.div
              className="flex overflow-x-auto gap-2 px-3 py-3 bg-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {images.map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i}`}
                  className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                    selectedImage === img ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => handleImageClick(img, i)}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </motion.div>
          )}

          {/* Details Section */}
          <motion.div className="px-6 py-5 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Home size={22} className="text-blue-400" /> {title}
              </h1>
              <p className="flex items-center gap-2 mt-2 text-gray-300">
                <MapPin size={16} className="text-blue-400" /> {location}
              </p>
              <p className="text-green-400 font-bold text-xl mt-3 flex items-center gap-2">
                <Wallet size={18} /> ₦{price?.toLocaleString()}
                <span className="text-gray-300 text-base font-medium">/sale</span>
              </p>
            </div>

            {/* Description */}
            {description && (
              <motion.p className="text-gray-300 leading-relaxed text-[15px]">{description}</motion.p>
            )}

            {/* Footer Stats */}
            <div className="flex flex-wrap gap-4 text-gray-300 text-sm sm:text-base">
              <span className="flex items-center gap-2">
                <BedDouble size={18} className="text-blue-400" /> {bedrooms || "—"} Beds
              </span>
              <span className="flex items-center gap-2">
                <Bath size={18} className="text-blue-400" /> {bathrooms || "—"} Baths
              </span>
              <span className="flex items-center gap-2">
                <Toilet size={18} className="text-blue-400" /> {toilets || "—"} Toilets
              </span>
              <span className="flex items-center gap-2">
                <Car size={18} className="text-blue-400" /> {parking || "—"} Parking
              </span>
              <span className="flex items-center gap-2">
                <Ruler size={18} className="text-blue-400" /> {size || "—"} m²
              </span>
            </div>

        {/* 🧑‍💼 Seller Card */}
<motion.div className="bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md border border-gray-700">
  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
    <Home size={20} className="text-blue-400" /> Seller Info
  </h2>

  {/* Seller Info */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
    {/* Avatar */}
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
      />
    </div>

    {/* Info */}
    <div className="mt-3 sm:mt-0 text-center sm:text-left flex-1">
      <p className="text-base sm:text-lg font-semibold text-white">
        {house.landlord?.name || "Unknown Seller"}
      </p>
      <div className="mt-1 space-y-1 text-gray-300 text-sm sm:text-base">
        <p className="flex items-center justify-center sm:justify-start gap-2 truncate">
          <Mail size={14} className="text-blue-400" />{" "}
          {house.landlord?.email || "No Email"}
        </p>
        <p className="flex items-center justify-center sm:justify-start gap-2 truncate">
          <Phone size={14} className="text-blue-400" />{" "}
          {house.landlord?.phone || "No Phone"}
        </p>
      </div>
    </div>
  </div>

  {/* Contact Buttons */}
  <div className="flex flex-row flex-wrap justify-center sm:justify-start gap-3 mt-5">
    {house.landlord?.phone && (
      <a
        href={`tel:${house.landlord.phone}`}
        className="flex items-center justify-center gap-2 bg-white text-blue-700 text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition min-w-[110px]"
      >
        <Phone size={16} className="sm:size-18" /> Call
      </a>
    )}
    {house.landlord?.phone && (
      <a
        href={`https://wa.me/${house.landlord.phone}?text=${encodeURIComponent(
          message
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-3 rounded-full font-semibold hover:bg-green-600 transition min-w-[110px]"
      >
        <FaWhatsapp size={16} className="sm:size-18" /> WhatsApp
      </a>
    )}
  </div>
</motion.div>
          </motion.div>

          {/* Recommended Section */}
          {recommendedHouses.length > 0 && (
            <motion.div className="px-6 py-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <h2 className="text-lg sm:text-xl font-bold mb-3 text-white">
                You may also like
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {recommendedHouses.map((rec) => (
                  <Link
                    key={rec._id}
                    to={`/buy/${rec._id}`}
                    className="min-w-[200px] bg-gray-800 shadow-md rounded-xl p-3 flex-shrink-0 relative hover:shadow-lg transition-all border border-gray-700"
                  >
                    <img
                      src={rec.images?.[0] || "/default-house.jpg"}
                      alt={rec.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <span
                      className={`absolute top-2 right-2 px-3 py-0.5 text-xs rounded-full font-semibold ${
                        rec.available
                          ? "bg-green-600 text-white border border-green-500"
                          : "bg-red-600 text-white border border-red-500"
                      }`}
                    >
                      {rec.available ? "Available" : "Sold"}
                    </span>
                    <h3 className="mt-2 font-semibold text-white">{rec.title}</h3>
                    <p className="text-gray-300 text-sm">{rec.location}</p>
                    <p className="mt-1 font-semibold text-green-400">
                      ₦{rec.price?.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.button
              className="absolute top-6 right-6 text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
              onClick={() => setZoomOpen(false)}
              whileHover={{ scale: 1.1 }}
            >
              <X size={24} />
            </motion.button>

            <div className="flex items-center justify-center w-full h-full px-6">
              <button
                className="text-white p-3 rounded-full hover:bg-gray-800"
                onClick={prevImage}
              >
                <ChevronLeft size={32} />
              </button>
              <motion.img
                key={zoomIndex}
                src={images?.[zoomIndex]}
                alt="Zoomed"
                className="max-h-[90vh] max-w-full object-contain rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              />
              <button
                className="text-white p-3 rounded-full hover:bg-gray-800"
                onClick={nextImage}
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
