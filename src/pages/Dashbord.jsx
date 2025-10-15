import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  Home,
  PlusCircle,
  Edit3,
  Trash2,
  MapPin,
  XCircle,
  Upload,
} from "lucide-react";

export default function DashBoard() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [landlordHouses, setLandlordHouses] = useState([]);
  const [zoomedId, setZoomedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loadingHouses, setLoadingHouses] = useState(true);

  // ✅ Only landlords can access this dashboard
  if (user?.role !== "landlord") {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center text-gray-700">
        🚫 Access Denied — Landlords Only
      </div>
    );
  }

  // Fetch landlord houses
  useEffect(() => {
    const fetchMyHouses = async () => {
      setLoadingHouses(true);
      try {
        const res = await API.get("/houses/my");
        const housesData = Array.isArray(res.data)
          ? res.data
          : res.data.houses || [];
        setLandlordHouses(housesData);
      } catch (error) {
        toast.error("Failed to load your listings");
        setLandlordHouses([]);
      } finally {
        setLoadingHouses(false);
      }
    };
    fetchMyHouses();
  }, []);

  // Handle form change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !editing) return toast.error("Please select an image");
    setUploading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append("image", image);

      const res = editing
        ? await API.put(`/houses/${editing._id}`, form)
        : await API.post("/houses", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      setLandlordHouses((prev) =>
        editing
          ? prev.map((h) => (h._id === editing._id ? res.data.house || res.data : h))
          : [...prev, res.data.house]
      );

      setForm({ title: "", location: "", price: "", description: "" });
      setImage(null);
      setEditing(null);
      toast.success(editing ? "✅ House updated!" : "🏠 House added!");
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error uploading house:", error);
    } finally {
      setUploading(false);
    }
  };

  // Delete house
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await API.delete(`/houses/${id}`);
      setLandlordHouses((prev) => prev.filter((h) => h._id !== id));
      toast.success("🗑️ House deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Start editing house
  const startEditing = (house) => {
    setEditing(house);
    setForm({
      title: house.title,
      location: house.location,
      price: house.price,
      description: house.description,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4 sm:px-10">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-10 justify-center">
        <Home className="text-blue-600" size={34} />
        <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-sm">
          Landlord Dashboard
        </h1>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100 mb-12 max-w-4xl mx-auto transition-all duration-300"
      >
        <h2 className="text-xl font-semibold mb-5 text-blue-700 flex items-center gap-2">
          {editing ? <Edit3 size={20} /> : <PlusCircle size={20} />}
          {editing ? "Edit House" : "Post a New House"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <input
            type="text"
            name="title"
            placeholder="House Title"
            value={form.title}
            onChange={handleChange}
            className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price (₦)"
            value={form.price}
            onChange={handleChange}
            className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
            required
          />
          {!editing && (
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-blue-50 transition bg-gray-50">
              <Upload size={18} className="text-blue-600" />
              <span className="text-gray-700">
                {image ? image.name : "Upload house image"}
              </span>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
                accept="image/*"
                required={!editing}
              />
            </label>
          )}
        </div>

        <textarea
          name="description"
          placeholder="Brief description about the house"
          value={form.description}
          onChange={handleChange}
          className="p-3 border rounded-xl mt-5 w-full focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
          rows="3"
          required
        />

        <div className="mt-5 flex flex-wrap gap-3 items-center">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition"
          >
            {uploading ? "Uploading..." : editing ? "Update House" : "Add House"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", location: "", price: "", description: "" });
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* My Listings */}
      <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2 justify-center">
        <MapPin size={22} className="text-blue-600" /> My Listings
      </h2>

      {loadingHouses ? (
        <p className="text-center text-gray-500">Loading houses...</p>
      ) : landlordHouses.length === 0 ? (
        <p className="text-center text-gray-500">No houses posted yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {landlordHouses.map((h) => (
            <div
              key={h._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-transform duration-300 border border-gray-100"
            >
              <img
                src={h.image || "https://via.placeholder.com/400x300?text=No+Image"}
                alt={h.title}
                onClick={() => setZoomedId(h._id)}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800">{h.title}</h3>
                <p className="text-gray-500">{h.location}</p>
                <p className="text-blue-600 font-semibold mt-2">
                  ₦{Number(h.price).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{h.description}</p>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => startEditing(h)}
                    className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(h._id)}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>

              {/* Zoomed Image Modal */}
              {zoomedId === h._id && (
                <div
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
                  onClick={() => setZoomedId(null)}
                >
                  <img
                    src={h.image || "https://via.placeholder.com/800x600?text=No+Image"}
                    alt={h.title}
                    className="max-w-[90%] max-h-[90%] border rounded-xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
