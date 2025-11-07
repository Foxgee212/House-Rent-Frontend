import React from "react";
import { useParams, Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, BedDouble, Bath, Phone, Home } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function BuyDetail() {
  const { id } = useParams();
  const { housesForSale } = useHouses();
  const house = housesForSale.find((h) => h._id === id);

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
    sellerName,
    sellerPhone,
  } = house;

  const firstImage = images?.[0] || "/default-house.jpg";
  const message = `Hello, I'm interested in purchasing your property located in ${location}. Is it still available?`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <motion.div
        className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={firstImage}
          alt={title}
          className="object-cover w-full h-full brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute top-5 left-5 z-20">
          <Link
            to="/buy"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm sm:text-base text-white backdrop-blur-md border border-white/20"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
        <div className="absolute bottom-10 left-6 right-6 sm:left-10 sm:right-10 z-20">
          <motion.h1
            className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {title || "Modern Family Home"}
          </motion.h1>
          <motion.p
            className="mt-2 text-gray-200 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <MapPin size={18} className="text-blue-400" />
            {location}
          </motion.p>
        </div>
      </motion.div>

      {/* Details Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        <motion.div
          className="bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
            <span className="text-blue-400 text-xl sm:text-2xl font-bold">
              ₦{price?.toLocaleString()}{" "}
              <span className="text-gray-400 text-sm font-medium">Asking Price</span>
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-gray-300 text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <BedDouble size={18} className="text-blue-400" />
              {bedrooms || "—"} Bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath size={18} className="text-blue-400" />
              {bathrooms || "—"} Bathrooms
            </span>
          </div>

          <p className="mt-6 text-gray-300 leading-relaxed">
            {description ||
              "This spacious and modern home offers a perfect blend of comfort, luxury, and style — ideal for family living or investment."}
          </p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 sm:p-8 rounded-3xl shadow-lg text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold mb-2">Contact Seller</h3>
          <p className="text-blue-100 mb-4">
            Interested in this property? Reach out to the seller directly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {sellerPhone && (
              <a
                href={`tel:${sellerPhone}`}
                className="flex items-center gap-2 bg-white text-blue-700 px-5 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                <Phone size={18} /> Call Seller
              </a>
            )}
            {sellerPhone && (
              <a
                href={`https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-700 px-5 py-3 rounded-full font-semibold hover:bg-blue-800 transition"
              >
                <FaWhatsapp size={18} /> WhatsApp
              </a>
            )}
          </div>
          {sellerName && (
            <p className="text-sm text-blue-100 mt-4">
              Seller: {sellerName}
            </p>
          )}
        </motion.div>
      </section>

      {/* Recommended Properties */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-6">
          You may also like
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {housesForSale
            .filter((h) => h._id !== id)
            .slice(0, 4)
            .map((rec) => (
              <Link
                key={rec._id}
                to={`/buy/${rec._id}`}
                className="bg-white/5 hover:bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={rec.images?.[0] || "/default-house.jpg"}
                  alt={rec.title}
                  className="w-full h-32 sm:h-40 object-cover rounded-xl mb-3"
                />
                <p className="text-sm sm:text-base font-medium text-white truncate">
                  {rec.title}
                </p>
                <p className="text-blue-400 text-xs sm:text-sm">
                  ₦{rec.price?.toLocaleString()}
                </p>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
