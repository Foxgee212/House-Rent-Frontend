import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Building2 } from "lucide-react";
import AdminHousesRent from "./AdminHousesRent";
import AdminHousesSales from "./AdminHousesSales";

export default function AdminHousesDashboard() {
  const [activeCard, setActiveCard] = useState(null); // "rent" | "sale" | null

  // Top-level cards: Rents & Sales
  const cards = [
    {
      label: "Rents",
      icon: <Home className="text-indigo-500" size={22} />,
      type: "rent",
    },
    {
      label: "Sales",
      icon: <Building2 className="text-green-500" size={22} />,
      type: "sale",
    },
  ];

  // Render top-level cards
  const renderCards = () => (
    <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto mt-20">
      {cards.map((c) => (
        <motion.div
          key={c.type}
          onClick={() => setActiveCard(c.type)}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer p-6 rounded-2xl bg-gray-800 border border-gray-700 flex flex-col items-center justify-center shadow-md"
        >
          {c.icon}
          <h3 className="mt-2 text-lg font-semibold text-gray-200">{c.label}</h3>
        </motion.div>
      ))}
    </div>
  );

  // Render selected component
  const renderActive = () => {
    if (activeCard === "rent") return <AdminHousesRent onBack={() => setActiveCard(null)} />;
    if (activeCard === "sale") return <AdminHousesSales onBack={() => setActiveCard(null)} />;
    return renderCards();
  };

  return <div className="min-h-screen bg-gray-950 text-gray-100">{renderActive()}</div>;
}
