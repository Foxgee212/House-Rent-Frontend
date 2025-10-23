import { useState } from "react";
import Topbar from "./Topbar";
import StatsCards from "./StatsCards";
import AdminHouses from "../pages/AdminHouses";
import ApprovedHouses from "./Approvedhouses";
import PendingHouses from "./PendingHouses";
import UsersTable from "./UsersTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("houses");

  const renderContent = () => {
    switch (activeTab) {
      case "approved":
        return <ApprovedHouses />;
      case "pending":
        return <PendingHouses />;
      case "users":
        return <UsersTable />;
      default:
        return <AdminHouses />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Topbar */}
      <Topbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="p-4 sm:p-6 space-y-6 flex-1">
        {/* ✅ Pass both props so StatsCards knows which one is active */}
        <StatsCards activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="space-y-6">{renderContent()}</div>
      </main>
    </div>
  );
}
