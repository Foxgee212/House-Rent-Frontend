import { Home, Users, LogOut } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 bg-white shadow-md p-5 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-8 text-indigo-600">SkyRent Admin</h1>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("houses")}
            className={`flex items-center gap-2 w-full text-left p-2 rounded-lg ${
              activeTab === "houses" ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100"
            }`}
          >
            <Home size={18} /> Houses
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 w-full text-left p-2 rounded-lg ${
              activeTab === "users" ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100"
            }`}
          >
            <Users size={18} /> Users
          </button>
        </nav>
      </div>

      <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 p-2">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
