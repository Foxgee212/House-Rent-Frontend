import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHouses } from "../context/HouseContext";
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
import { useAuth } from "../context/AuthContext";

export default function HouseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { houses } = useHouses();

  const [house, setHouse] = useState(null);
  const [recommendedHouses, setRecommendedHouses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch and load house
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800); // Simulate smooth load
    const found = houses.find((h) => h._id === id);
    if (found) {
      setHouse(found);
      setSelectedImage(found.images?.[0]);
    }
    return () => clearTimeout(timer);
  }, [id, houses]);

  // Recommendations
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

  // Skeleton loading screen
  if (loading || !house) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-12 animate-pulse">
        <div className="h-72 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 md:px-6 transition-all duration-500">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* ✅ Main Image */}
        <div className="relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          )}
          <img
            src={selectedImage || house.images?.[0] || "https://via.placeholder.com/800x500"}
            alt={house.title}
            onLoad={() => setImageLoaded(true)}
            onClick={() => openZoom(zoomIndex)}
            className={`w-full h-72 md:h-96 object-cover cursor-pointer rounded-b-none transition-all duration-700 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />

          {/* ✅ Availability Badge */}
          <span
            className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${
              house.available
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {house.available ? "Available" : "Occupied"}
          </span>
        </div>

        {/* ✅ Thumbnails Carousel */}
        <div className="flex overflow-x-auto gap-3 p-4 bg-gray-100 dark:bg-gray-700">
          {house.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Thumbnail ${i}`}
              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                selectedImage === img ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => handleImageClick(img, i)}
            />
          ))}
        </div>

        {/* ✅ House Info */}
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-opacity duration-300">
            <Home size={24} className="text-blue-600" /> {house.title}
          </h1>

          <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="text-blue-500" /> {house.location}
          </div>

          <p className="text-blue-700 dark:text-blue-400 font-bold text-xl mt-3 flex items-center gap-2">
            <Wallet size={18} /> ₦{house.price?.toLocaleString()}
            <span className="text-gray-500 dark:text-gray-400 text-base font-medium">
              /month
            </span>
          </p>

          {house.description && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {house.description}
            </p>
          )}

          {house.landlord && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-600" />
                Landlord Info
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
                {/* Profile Image */}
                <div className="relative mx-auto sm:mx-0">
                  <img
                    src={house.landlord.profilePic || "/default-profile.png"}
                    alt="Landlord Profile"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-blue-500 shadow-lg"
                  />
                  {/* Online indicator (optional) */}
                  <span className="absolute bottom-2 right-2 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                </div>

                {/* Info Section */}
                <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1">
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {house.landlord.name}
                  </p>

                  <div className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                    <p className="flex items-center justify-center sm:justify-start gap-2">
                      <Mail size={16} className="text-blue-500" />
                      <span>{house.landlord.email}</span>
                    </p>

                    <p className="flex items-center justify-center sm:justify-start gap-2">
                      <Phone size={16} className="text-blue-500" />
                      <span>{house.landlord.phone}</span>
                    </p>
                  </div>

                </div>
              </div>
            </div>

          )}

          <button
            className="mt-6 w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
            onClick={handleWhatsAppContact}
          >
            <MessageCircle size={18} /> Contact Landlord
          </button>
        </div>
      </div>

      {/* ✅ Recommended Houses */}
      {recommendedHouses.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Recommended for You
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendedHouses.map((h) => (
              <div
                key={h._id}
                className="min-w-[220px] bg-white dark:bg-gray-700 shadow-md rounded-xl p-3 flex-shrink-0 relative hover:shadow-lg transition-all duration-200"
              >
                <img
                  src={h.images?.[0] || "https://via.placeholder.com/200x120"}
                  alt={h.title}
                  className="w-full h-32 object-cover rounded-lg"
                />

                <span
                  className={`absolute top-2 right-2 px-3 py-0.5 text-xs rounded-full font-semibold ${
                    h.available
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {h.available ? "Available" : "Occupied"}
                </span>

                <h3 className="mt-2 font-semibold text-gray-800 dark:text-gray-100">
                  {h.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{h.location}</p>
                <p className="mt-1 font-semibold text-blue-700 dark:text-blue-400">
                  ₦{h.price?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Fullscreen Zoom Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 backdrop-blur-sm transition-opacity">
          <button
            className="absolute top-6 right-6 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
            onClick={() => setZoomOpen(false)}
          >
            <X size={24} />
          </button>

          <div className="flex items-center justify-center w-full h-full px-6">
            <button
              className="text-white p-3 rounded-full hover:bg-gray-700"
              onClick={prevImage}
            >
              <ChevronLeft size={32} />
            </button>

            <img
              src={house.images?.[zoomIndex]}
              alt="Zoomed view"
              className="max-h-[90vh] max-w-full object-contain rounded-xl transition-transform duration-300"
            />

            <button
              className="text-white p-3 rounded-full hover:bg-gray-700"
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
