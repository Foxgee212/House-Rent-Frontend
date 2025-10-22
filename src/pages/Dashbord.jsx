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
  X,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import imageCompression from "browser-image-compression";

export default function DashBoard() {
  const { user } = useAuth();
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
        setLandlordHouses(res.data?.houses || res.data || []);
      } catch {
        toast.error("Failed to load your listings");
      } finally {
        setLoadingHouses(false);
      }
    };
    fetchMyHouses();
  }, []);

  // Handle form input
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handle image selection + compression
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const compressedFiles = [];
    const newPreviews = [];

    for (const file of files) {
      try {
        const options = {
          maxSizeMB: 1, // max 1 MB per image
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4 sm:px-10 transition-all">
      {/* Title */}
      <div className="flex items-center gap-3 mb-10 justify-center">
        <Home className="text-blue-600" size={34} />
        <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-sm">
          Landlord Dashboard
        </h1>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100 mb-12 max-w-4xl mx-auto"
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
                {images.length > 0
                  ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
                  : "Upload house images"}
              </span>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </label>
          )}
        </div>

        {/* Negotiable toggle */}
        <div className="mt-3 flex items-center gap-3">
          <Switch
            checked={form.negotiable}
            onChange={(val) => setForm((prev) => ({ ...prev, negotiable: val }))}
            className={`${form.negotiable ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${form.negotiable ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-700 font-medium">Price Negotiable</span>
        </div>

        {/* Image previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5">
            {previewUrls.map((url, i) => (
              <div
                key={i}
                className="relative w-24 h-24 border rounded-xl overflow-hidden shadow-sm group"
              >
                <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover"/>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
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
                setForm({ title: "", location: "", price: "", description: "", negotiable: false });
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* My Listings */}
      {loadingHouses ? (
        <p className="text-center text-gray-500">Loading houses...</p>
      ) : landlordHouses.length === 0 ? (
        <p className="text-center text-gray-500">No houses posted yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {landlordHouses.map((h) => (
            <div key={h._id} className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-transform duration-300 border border-gray-100">
              <img
                src={h.images?.[0] || "https://placehold.co/400x300?text=No+Image"}
                alt={h.title}
                onClick={() => { setZoomedHouse(h); setActiveIndex(0); }}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
              />
              {h.images?.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  +{h.images.length - 1} more
                </span>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800">{h.title}</h3>
                <p className="text-gray-500">{h.location}</p>
                <p className="text-blue-600 font-semibold mt-2 flex items-center gap-2">
                  ₦{Number(h.price).toLocaleString()}
                  {h.negotiable && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Negotiable
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{h.description}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className={`text-sm font-medium ${h.available ? "text-green-600" : "text-red-500"}`}>
                    {h.available ? "Available" : "Occupied"}
                  </span>
                  <Switch
                    checked={h.available}
                    onChange={() => toggleAvailability(h._id, h.available)}
                    className={`${h.available ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span className={`${h.available ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                  </Switch>
                </div>

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
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedHouse && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 overflow-auto"
          onClick={() => setZoomedHouse(null)}
        >
          <button
            className="absolute top-5 right-5 bg-white/80 text-black rounded-full p-2 shadow-md hover:bg-white transition"
            onClick={() => setZoomedHouse(null)}
          >
            <X size={20} />
          </button>
          <div
            className="relative flex flex-col items-center gap-4 max-w-[90%] max-h-[90%] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedHouse.images?.[activeIndex] || zoomedHouse.images?.[0] || "https://via.placeholder.com/800x500?text=No+Image"}
              alt={zoomedHouse.title || "House Image"}
              className="max-w-[90%] max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white/20 transition-transform duration-300"
            />
            {zoomedHouse.negotiable !== undefined && (
              <div
                className={`absolute top-5 right-5 text-xs font-semibold px-3 py-1 rounded-full shadow-md border ${
                  zoomedHouse.negotiable
                    ? "bg-green-100 text-green-800 border-green-300"
                    : "bg-gray-200 text-gray-700 border-gray-300"
                }`}
              >
                {zoomedHouse.negotiable ? "Negotiable" : "Fixed Price"}
              </div>
            )}
            <div className="flex gap-2 flex-wrap justify-center mt-4">
              {zoomedHouse.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`House ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`w-20 h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${
                    index === activeIndex
                      ? "border-blue-500 scale-105"
                      : "border-transparent hover:opacity-80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
