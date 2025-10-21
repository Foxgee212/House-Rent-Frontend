import { useEffect, useState } from "react";
import API from "../Api/axios";

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalHouses: 0,
    approvedHouses: 0,
    pendingHouses: 0,
    totalUsers: 0,
  });


  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // avoid state update on unmounted component

    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        if (isMounted) setStats(res.data);
      
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats(); // initial fetch
    const interval = setInterval(fetchStats, 5000); // fetch every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval); // cleanup
    };
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading stats...</p>;
  }

  const cards = [
    { label: "Total Houses", value: stats.totalHouses },
    { label: "Approved", value: stats.approvedHouses },
    { label: "Pending", value: stats.pendingHouses },
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
