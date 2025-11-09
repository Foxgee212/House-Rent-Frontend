import { useState } from "react";
import StatsCards from "./StatsCards";
import AdminHouses from "./AdminHouses";
import ApprovedHouses from "./Approvedhouses";
import PendingHouses from "./PendingHouses";
import UsersTable from "./UsersTable";
import VerificationTable from "./VerificationTable";

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
      case "verifications":
        return <VerificationTable />;
      default:
        return <AdminHouses />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="p-4 sm:p-6 space-y-6 flex-1">
        {/* ✅ StatsCards now includes verification overview */}
        <StatsCards activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="space-y-6">{renderContent()}</div>
      </main>
    </div>
  );
}
