import { useState }  from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatsCards from "./StatsCards";
import HousesTable from "./HousesTable";
import UsersTable from "./UsersTable";


export default function AdminDashboard() {
const [activeTab, setActiveTab] = useState("houses")
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 space-y-6">
          <StatsCards houses={houses} users={users} />
          {activeTab === "houses" ? (
            <HousesTable houses={houses} approveHouse={approveHouse} deleteHouse={deleteHouse} />
          ) : (
            <UsersTable users={users} deleteUser={deleteUser} />
          )}
        </main>
      </div>
    </div>
  );
}
