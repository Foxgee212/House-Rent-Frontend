import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHouses } from "../context/HouseContext";
import { MapPin, Mail, User, Home, Wallet, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function HouseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { houses } = useHouses();

  const [house, setHouse] = useState(null);
  const [recommendedHouses, setRecommendedHouses] = useState([]);

  const landlordPhone = user?.phone || "2340000000000";
  const message = `Hello, I am interested in your ${house?.title || ''} located in ${house?.location || ''}. Is it still available?`;

  // Get the main house
  useEffect(() => {
    const foundHouse = houses.find(h => h._id === id);
    setHouse(foundHouse || null);
  }, [id, houses]);

  // Compute recommendations AFTER house is loaded
  useEffect(() => {
    if (!house || !user?.location) return;

    const tenantState = user.location.split(", ")[0];
    const tenantLGA = user.location.split(", ")[1];

    const priceRange = 0.2; // 20% above or below house price

    const recommendations = houses.filter(h => {
      if (h._id === house._id) return false; // exclude current house

      // location match (either state or LGA)
      const locationMatch = (h.state && h.state === tenantState) || (h.localGovernment && h.localGovernment === tenantLGA);

      // price match within ±20%
      const minPrice = house.price * (1 - priceRange);
      const maxPrice = house.price * (1 + priceRange);
      const priceMatch = h.price >= minPrice && h.price <= maxPrice;

      return locationMatch && priceMatch;
    });

    setRecommendedHouses(recommendations.slice(0, 5));
  }, [house, houses, user]);

  const handleWhatsAppContact = () => {
    const formattedPhone = landlordPhone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  if (!house) return <p className="p-12 text-center text-gray-500 text-lg animate-pulse">Loading house details...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 md:px-6">
      {/* Main House Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <img
          src={house.image || "https://via.placeholder.com/800x500"}
          alt={house.title}
          className="w-full h-64 md:h-72 object-cover"
        />
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Home size={24} className="text-blue-600" /> {house.title}
          </h1>

          <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="text-blue-500" /> {house.location}
          </div>

          <p className="text-blue-700 dark:text-blue-400 font-bold text-xl mt-3 flex items-center gap-2">
            <Wallet size={18} /> ₦{house.price?.toLocaleString()}
            <span className="text-gray-500 dark:text-gray-400 text-base font-medium">/month</span>
          </p>

          {house.description && <p className="mt-4 text-gray-700 dark:text-gray-300">{house.description}</p>}

          {house.landlord && (
            <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-2">
                <User size={18} className="text-blue-600" /> Landlord Info
              </h2>
              <p>{house.landlord.name}</p>
              <p>{house.landlord.email}</p>
              <p>{landlordPhone}</p>
            </div>
          )}

          <button
            className="mt-6 w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            onClick={handleWhatsAppContact}
          >
            <MessageCircle size={18} /> Contact Landlord
          </button>
        </div>
      </div>

      {/* Recommended Houses */}
      {recommendedHouses.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendedHouses.map(h => (
              <div key={h._id} className="min-w-[200px] bg-white dark:bg-gray-700 shadow-md rounded-xl p-3 flex-shrink-0">
                <img src={h.image || "https://via.placeholder.com/200x120"} alt={h.title} className="w-full h-32 object-cover rounded-lg" />
                <h3 className="mt-2 font-semibold text-gray-800 dark:text-gray-100">{h.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{h.location}</p>
                <p className="mt-1 font-semibold text-blue-700 dark:text-blue-400">₦{h.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
