import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Switch } from "@headlessui/react";
import imageCompression from "browser-image-compression";

export default function DashBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    negotiable: false,
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [landlordHouses, setLandlordHouses] = useState([]);
  const [zoomedHouse, setZoomedHouse] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editing, setEditing] = useState(null);
  const [loadingHouses, setLoadingHouses] = useState(true);

  // Restrict non-landlords
  if (user?.role !== "landlord") {
    return (
      <div className="p-8 text-center text-gray-400">
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
    setLandlordHouses(res.data?.houses || res.data || []);
  } catch (err) {
    // Extract backend error message
    const message =
      err.response?.data?.error || err.response?.data?.msg || err.message;

    if (message?.toLowerCase().includes("identity verification required")) {
      toast.error("Please verify your identity to view your houses");
    } else {
      toast.error("Failed to load your listings");
    }
  } finally {
    setLoadingHouses(false);
  }
};

fetchMyHouses()
  }, []);

  // Form changes
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const compressedFiles = [];
    const newPreviews = [];

    for (const file of files) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);
        newPreviews.push(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }

    setImages((prev) => [...prev, ...compressedFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && images.length === 0)
      return toast.error("Please select at least one image");

    if (user.verificationStatus !== "verified") {
      toast.error("You must verify your identity before posting houses");
      navigate("/verify");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) =>
        formData.append(key, typeof val === "boolean" ? (val ? "true" : "false") : val)
      );
      images.forEach((img) => formData.append("images", img));

      const res = editing
        ? await API.put(`/houses/${editing._id}`, form)
        : await API.post("/houses", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      setLandlordHouses((prev) =>
        editing
          ? prev.map((h) =>
              h._id === editing._id ? res.data.house || res.data : h
            )
          : [...prev, res.data.house]
      );

      toast.success(editing ? "✅ House updated!" : "🏠 House added!");
      setForm({ title: "", location: "", price: "", description: "", negotiable: false });
      setImages([]);
      setPreviewUrls([]);
      setEditing(null);
    } catch (error) {
      console.error("Error uploading house:", error);
      toast.error("Something went wrong while uploading");
    } finally {
      setUploading(false);
    }
  };

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

  const startEditing = (house) => {
    setEditing(house);
    setForm({
      title: house.title,
      location: house.location,
      price: house.price,
      description: house.description,
      negotiable: house.negotiable || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await API.patch(
        `/houses/${id}/availability`,
        { available: !currentStatus },
        { headers: { "Content-Type": "application/json" } }
      );
      setLandlordHouses((prev) =>
        prev.map((h) => (h._id === id ? { ...h, available: !currentStatus } : h))
      );
      toast.success(!currentStatus ? "🏠 House marked as available" : "🚫 House marked as occupied");
    } catch {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <Home size={34} className="text-blue-500 drop-shadow-md" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Landlord Dashboard
        </h1>
      </div>

      {/* Verification Notice */}
      {user.verificationStatus !== "verified" && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-yellow-50 border border-yellow-400 text-yellow-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <p>
            ⚠️ Your account is not verified. You must verify your identity to post houses.
          </p>
          <button
            onClick={() => navigate("/verify")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Verify Identity
          </button>
        </div>
      )}

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className={`bg-gray-800 border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto space-y-5 transition-all ${
          user.verificationStatus !== "verified" ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
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
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price (₦)"
            value={form.price}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          {!editing && (
            <label className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition">
              <Upload size={18} className="text-blue-400" />
              <span className="text-gray-300">
                {images.length > 0
                  ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
                  : "Upload house images"}
              </span>
              <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
            </label>
          )}
        </div>

        {/* Negotiable */}
        <div className="flex items-center gap-3">
          <Switch
            checked={form.negotiable}
            onChange={(val) => setForm((p) => ({ ...p, negotiable: val }))}
            className={`${form.negotiable ? "bg-blue-600" : "bg-gray-600"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${form.negotiable ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-300">Price Negotiable</span>
        </div>

        {/* Previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          name="description"
          placeholder="Brief description about the house"
          value={form.description}
          onChange={handleChange}
          rows="3"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-700/30"
          >
            {uploading ? "Uploading..." : editing ? "Update House" : "Add House"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", location: "", price: "", description: "", negotiable: false });
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400"
            >
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Listings */}
      <div className="mt-10">
        {loadingHouses ? (
          <p className="text-center text-gray-400">Loading houses...</p>
        ) : landlordHouses.length === 0 ? (
          <p className="text-center text-gray-400">No houses posted yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {landlordHouses.map((h) => (
              <div
                key={h._id}
                className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                <img
                  src={h.images?.[0] || "https://placehold.co/400x300?text=No+Image"}
                  alt={h.title}
                  onClick={() => { setZoomedHouse(h); setActiveIndex(0); }}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                />
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-semibold text-white">{h.title}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin size={14} /> {h.location}
                  </p>
                  <p className="text-blue-400 font-semibold mt-2">
                    ₦{Number(h.price).toLocaleString()}
                    {h.negotiable && (
                      <span className="ml-2 text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                        Negotiable
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400 line-clamp-2">{h.description}</p>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-sm ${h.available ? "text-green-400" : "text-red-400"}`}>
                      {h.available ? "Available" : "Occupied"}
                    </span>
                    <Switch
                      checked={h.available}
                      onChange={() => toggleAvailability(h._id, h.available)}
                      className={`${h.available ? "bg-green-500" : "bg-gray-600"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${h.available ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startEditing(h)}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
