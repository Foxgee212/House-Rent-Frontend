import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  User,
  Home,
  Wallet,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import { useHouses } from "../context/HouseContext";
import { useAuth } from "../context/AuthContext";

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

  const message = `Hello, I am interested in your ${house?.title || ""} located in ${
    house?.location || ""
  }. Is it still available?`;

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
    setZoomIndex((prev) => (prev + 1) % (house?.images?.length || 1));
  };

  const prevImage = () => {
    setZoomIndex((prev) =>
      (prev - 1 + (house?.images?.length || 1)) % (house?.images?.length || 1)
    );
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
    <motion.div
      className="min-h-screen bg-gray-900 pb-16 transition-all duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card Wrapper */}
      <div className="px-4 sm:px-6 mt-6 flex justify-center">
        <div className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-700">
          {/* Header Image */}
          <div className="relative w-full">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
            )}
            <motion.img
              key={selectedImage}
              src={selectedImage || house.images?.[0]}
              alt={house.title}
              onLoad={() => setImageLoaded(true)}
              onClick={() => openZoom(zoomIndex)}
              className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.span
              className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${
                house.available
                  ? "bg-green-600 text-white border border-green-500"
                  : "bg-red-600 text-white border border-red-500"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {house.available ? "Available" : "Occupied"}
            </motion.span>
          </div>

          {/* Thumbnails */}
          <motion.div
            className="flex overflow-x-auto gap-2 px-3 py-3 bg-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {house.images?.map((img, i) => (
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

          {/* Content Section */}
          <motion.div
            className="px-6 py-5 space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Title & Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Home size={22} className="text-blue-400" /> {house.title}
              </h1>
              <p className="flex items-center gap-2 mt-2 text-gray-300">
                <MapPin size={16} className="text-blue-400" /> {house.location}
              </p>
              <p className="text-green-400 font-bold text-xl mt-3 flex items-center gap-2">
                <Wallet size={18} /> ₦{house.price?.toLocaleString()}
                <span className="text-gray-300 text-base font-medium">/month</span>
              </p>
            </div>

            {/* Description */}
            {house.description && (
              <motion.p className="text-gray-300 leading-relaxed text-[15px]">
                {house.description}
              </motion.p>
            )}

            {/* Landlord Card */}
            {house.landlord && (
              <motion.div className="bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md border border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <User size={20} className="text-blue-400" /> Landlord Info
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
                  <div className="relative mx-auto sm:mx-0">
                    <img
                      src={house.landlord.profilePic || "/default-profile.png"}
                      alt="Landlord"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-blue-400 shadow-md"
                    />
                    <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 rounded-full ring-2 ring-gray-900"></span>
                  </div>
                  <div className="mt-3 sm:mt-0 text-center sm:text-left flex-1">
                    <p className="text-lg font-semibold text-white">{house.landlord.name}</p>
                    <div className="mt-1 space-y-1 text-gray-300 text-sm sm:text-base">
                      <p className="flex items-center justify-center sm:justify-start gap-2">
                        <Mail size={15} className="text-blue-400" />
                        {house.landlord.email}
                      </p>
                      <p className="flex items-center justify-center sm:justify-start gap-2">
                        <Phone size={15} className="text-blue-400" />
                        {house.landlord.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Button */}
            <motion.button
              className="w-full sm:w-auto px-6 py-3 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              onClick={handleWhatsAppContact}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle size={18} /> Contact Landlord
            </motion.button>
          </motion.div>

          {/* Recommended Section */}
          {recommendedHouses.length > 0 && (
            <motion.div className="px-6 py-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <h2 className="text-lg sm:text-xl font-bold mb-3 text-white">
                Recommended for You
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {recommendedHouses.map((h) => (
                  <motion.div
                    key={h._id}
                    className="min-w-[200px] bg-gray-800 shadow-md rounded-xl p-3 flex-shrink-0 relative hover:shadow-lg transition-all border border-gray-700"
                    whileHover={{ scale: 1.03 }}
                  >
                    <img
                      src={h.images?.[0]}
                      alt={h.title}
                      className="w-full h-32 object-cover rounded-lg"
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
                      ₦{h.price?.toLocaleString()}
                    </p>
                  </motion.div>
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
              <button className="text-white p-3 rounded-full hover:bg-gray-800" onClick={prevImage}>
                <ChevronLeft size={32} />
              </button>
              <motion.img
                key={zoomIndex}
                src={house.images?.[zoomIndex]}
                alt="Zoomed"
                className="max-h-[90vh] max-w-full object-contain rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              />
              <button className="text-white p-3 rounded-full hover:bg-gray-800" onClick={nextImage}>
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
