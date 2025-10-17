import { useEffect, useState } from "react";
import API from "../api/axios.js"; // your pre-configured axios instance

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalHouses: 0,
    approved: 0,
    pending: 0,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        setStats(res.data);
        console.log(res.data)
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading stats...</p>;
  }

  const cards = [
    { label: "Total Houses", value: stats.totalHouses },
    { label: "Approved", value: stats.approved },
    { label: "Pending", value: stats.pending },
    { label: "Users", value: stats.totalUsers },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-all"
        >
          <h3 className="text-gray-500 text-sm">{c.label}</h3>
          <p className="text-2xl font-bold text-indigo-600">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
