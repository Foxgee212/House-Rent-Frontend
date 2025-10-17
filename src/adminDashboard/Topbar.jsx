export default function Topbar() {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Dashboard Overview</h2>
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/40"
          alt="Admin Avatar"
          className="w-10 h-10 rounded-full"
        />
        <span className="font-medium">Admin</span>
      </div>
    </header>
  );
}
