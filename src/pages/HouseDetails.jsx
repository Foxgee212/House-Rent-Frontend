import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHouses } from "../context/HouseContext";



export default function HouseDetail() {
  const { id } = useParams();
  const { houses } = useHouses();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // 1️⃣ Try to find house in context first
    const foundHouse = houses.find((h) => h._id === id);
    if (foundHouse) {
      setHouse(foundHouse);
      setLoading(false);
      return;
    }
    // 2️⃣ Fallback: fetch single house from backend
    const fetchHouse = async () => {
      try {
        const response = await fetch(`/api/houses/${id}`);
        const data = await response.json();
        setHouse(data);
      } catch (error) {
        console.error("Error fetching house:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [id, houses]);

  if (loading) return <p className="p-8 text-center text-gray-600">Loading house details...</p>;
  if (!house) return <p className="p-8 text-center text-gray-600">House not found!</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* House Image */}
      <img
        src={house.image || "https://via.placeholder.com/800x500?text=No+Image"}
        alt={house.title}
        className="w-full h-80 object-cover rounded-lg shadow"
      />

      {/* House Info */}
      <h1 className="text-3xl font-bold mt-6">{house.title}</h1>
      <p className="text-gray-600">{house.location}</p>
      <p className="text-blue-600 font-bold text-xl mt-2">
        ₦{house.price?.toLocaleString()}/month
      </p>
      <p className="mt-4 text-gray-700">{house.description}</p>

      {/* Landlord Info */}
      {house.landlord && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Landlord Information</h2>
          <p className="text-gray-700">Name: {house.landlord.name}</p>
          <p className="text-gray-700">Email: {house.landlord.email}</p>
        </div>
      )}

      {/* Contact Button */}
      <button
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={() => window.location.href = `mailto:${house.landlord?.email || ""}`}
      >
        Contact Landlord
      </button>
    </div>
  );
}
