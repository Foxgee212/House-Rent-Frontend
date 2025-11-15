import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ProtectedWatermarkedImage from "../images/ProtectedWatermarkedImage";

export default function ImageZoomModal({ images = [], activeIndex, setActiveIndex, onClose }) {
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);

  return (
    <AnimatePresence>
      {images.length > 0 && (
        <motion.div
          key="zoomModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-auto"
          onClick={onClose}
        >
          <motion.button
            onClick={onClose}
            className="absolute top-5 right-5 bg-gray-700 text-white rounded-full p-2 shadow-md hover:bg-gray-600 transition"
          >
            <X size={24} />
          </motion.button>

          <div className="relative max-w-[90%] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <ProtectedWatermarkedImage
              src={images[activeIndex]}
              alt={`Zoomed ${activeIndex + 1}`}
              className="w-full h-full object-contain rounded-2xl shadow-2xl border-4 border-gray-700"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-3 -translate-y-1/2 bg-gray-700/70 text-white p-2 rounded-full hover:bg-gray-600 transition"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-3 -translate-y-1/2 bg-gray-700/70 text-white p-2 rounded-full hover:bg-gray-600 transition"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap justify-center mt-4" onClick={(e) => e.stopPropagation()}>
              {images.map((img, index) => (
                <ProtectedWatermarkedImage
                  key={index}
                  src={img}
                  alt={`Thumb ${index + 1}`}
                  className={`w-16 h-12 sm:w-20 sm:h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                    index === activeIndex ? "border-blue-400 scale-105" : "border-transparent hover:opacity-80"
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
