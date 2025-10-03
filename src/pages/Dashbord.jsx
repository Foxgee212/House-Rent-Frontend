import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useHouses } from "../context/HouseContext";

export default function DashBoard() {
  const { houses, addHouse, deleteHouse } = useHouses();
  const [form, setForm] = useState({ title: "", location: "", price: "", description: "" });
  const [image, setImage] = useState(null);
  const [zoomedId, setZoomedId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Protect route
  if (!user || user.role !== "landlord") {
    navigate("/login");
    return null;
  }

  // Form change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Add new house
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image");

    try {
      setUploading(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("image", image);

      await addHouse(formData, token);
      setForm({ title: "", location: "", price: "", description: "" });
      setImage(null);
      alert("House added successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // Delete house
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteHouse(id, token);
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  // Filter only landlord's houses
  const landlordHouses = houses.filter((h) => h.landlord._id === user.id);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Landlord Dashboard</h1>

      {/* New House Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">Post a New House</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} className="p-3 border rounded-lg" required />
          <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="p-3 border rounded-lg" required />
          <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} className="p-3 border rounded-lg" required />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} className="p-3 border rounded-lg" accept="image/*" required />
        </div>
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-3 border rounded-lg mt-4 w-full" rows="3" required />
        <button type="submit" disabled={uploading} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60">
          {uploading ? "Uploading..." : "Add House"}
        </button>
      </form>

      {/* Listings */}
      <h2 className="text-xl font-semibold mb-4">My Listings</h2>
      {landlordHouses.length === 0 ? (
        <p className="text-gray-600">No houses posted yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {landlordHouses.map((h) => (
            <div key={h._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {h.image && <img src={h.image} alt={h.title} onClick={() => setZoomedId(h._id)} className="w-full h-40 object-cover cursor-pointer" />}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{h.title}</h3>
                <p className="text-gray-500">{h.location}</p>
                <p className="text-blue-600 font-bold mt-2">₦{h.price.toLocaleString()}</p>
                <p className="mt-2 text-sm">{h.description}</p>
                <button onClick={() => handleDelete(h._id)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
              </div>

              {/* Zoom overlay */}
              {zoomedId === h._id && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center" onClick={() => setZoomedId(null)}>
                  <img src={h.image} alt={h.title} className="max-w-[90%] max-h-[90%] border rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
