export default function HousesTable({ houses, approveHouse, deleteHouse }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Houses</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-2">Title</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((h) => (
            <tr key={h._id} className="border-t text-sm">
              <td className="p-2">{h.title}</td>
              <td className="p-2 capitalize">{h.status}</td>
              <td className="p-2 space-x-2">
                {h.status === "pending" && (
                  <button
                    onClick={() => approveHouse(h._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => deleteHouse(h._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
