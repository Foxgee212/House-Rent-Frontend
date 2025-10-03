import React, { useState } from "react";

export default function HouseCard({ house }) {
  const [zoomed, setZoomed] = useState(false);

  // Format price with commas + ₦
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
      {/* House Image */}
      <div className="relative">
        <img
          src={house.image || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={house.title}
          onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* House Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{house.title}</h3>
        <p className="text-gray-500">{house.location}</p>
        <p className="text-blue-600 font-bold mt-2">
          {formatPrice(house.price)}/month
        </p>

        {house.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {house.description}
          </p>
        )}
      </div>

      {/* Zoomed Image Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setZoomed(false)}
        >
          <img
            src={house.image || "https://via.placeholder.com/800x500?text=No+Image"}
            alt={house.title}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
