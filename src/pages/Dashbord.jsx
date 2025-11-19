import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  BedDouble,
  Bath,
  Toilet,
  Car,
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
    rooms: 0,
    baths: 0,
    toilets: 0,
    parking: 0,
    area: "",
    period: "per year",
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [landlordHouses, setLandlordHouses] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState(null);
  const [priceUnit, setPriceUnit] = useState("M");

  const limit = 6;

  if (user?.role !== "landlord") {
    return (
      <div className="p-8 text-center text-gray-400">
        🚫 Access Denied — Landlords Only
      </div>
    );
  }

  const fetchMyHouses = async (pageNum = 1, append = false) => {
    setLoadingHouses(true);
    try {
      const res = await API.get(`/rentals/my?page=${pageNum}&limit=${limit}`);
      const fetched = res.data?.houses || [];
      setLandlordHouses((prev) => (append ? [...prev, ...fetched] : fetched));
      setPage(pageNum);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load your listings");
    } finally {
      setLoadingHouses(false);
    }
  };

  useEffect(() => {
    fetchMyHouses();
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const compressedFiles = [];
    const newPreviews = [];
    for (const file of files) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
        compressedFiles.push(compressedFile);
        newPreviews.push(URL.createObjectURL(compressedFile));
      } catch (err) {
        console.error("Image compression error:", err);
      }
    }

    setImages((prev) => [...prev, ...compressedFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    // ⭐ NEW FEATURE: Auto-select first uploaded image as primary
    if (primaryImageIndex === null) {
      setPrimaryImageIndex(existingImages.length); 
    }

    e.target.value = null;
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && images.length === 0)
      return toast.error("Please select at least one image");

    // Allow posting ONLY if:
// 1. User is email verified
// 2. And EITHER:
//    - They haven't posted any property yet
//    - OR they are identity verified

const isVerified = user?.verification?.status === "verified";
const canPostFirst = user?.emailVerified && !user?.firstPropertyPosted;

if (!isVerified && !canPostFirst) {
  toast.error("Identity verification required to post more properties");
  navigate("/verify");
  return;
}


    setUploading(true);
    try {
      // Convert short price (2.5 + M) → full number (2500000)
      let numericPrice = Number(form.price);

      if (priceUnit === "K") numericPrice *= 1_000;
      if (priceUnit === "M") numericPrice *= 1_000_000;
      if (priceUnit === "B") numericPrice *= 1_000_000_000;
      // FULL means price stays as entered

      const updatedForm = { ...form, price: numericPrice };

      const formData = new FormData();
      Object.entries(updatedForm).forEach(([key, val]) =>
        formData.append(
          key,
          typeof val === "boolean" ? (val ? "true" : "false") : val
        )
      );

      if (existingImages.length > 0)
        formData.append("existingImages", JSON.stringify(existingImages));

      images.forEach((img) => formData.append("images", img));
      if (primaryImageIndex !== null)
        formData.append("primaryImageIndex", primaryImageIndex);

      const res = editing
        ? await API.put(`/rentals/${editing._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await API.post("/rentals", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      setLandlordHouses((prev) =>
        editing
          ? prev.map((h) => (h._id === editing._id ? res.data.house : h))
          : [res.data.house, ...prev]
      );

      toast.success(editing ? "✅ House updated!" : "🏠 House added!");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while uploading");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      location: "",
      price: "",
      description: "",
      negotiable: false,
      rooms: 0,
      baths: 0,
      toilets: 0,
      parking: 0,
      area: "",
      period: "per year",
    });
    setImages([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExistingImages([]);
    setPrimaryImageIndex(null);
    setEditing(null);
  };

  const startEditing = (house) => {
    setEditing(house);
    setForm({
      title: house.title,
      location: house.location,
      price: house.price,
      description: house.description,
      negotiable: house.negotiable || false,
      rooms: house.rooms || 0,
      baths: house.baths || 0,
      toilets: house.toilets || 0,
      parking: house.parking || 0,
      area: house.area || "",
      period: house.period || "per year",
    });
    // Auto-detect unit when editing
    if (sale.price >= 1_000_000_000) setPriceUnit("B");
    else if (sale.price >= 1_000_000) setPriceUnit("M");
    else if (sale.price >= 1_000) setPriceUnit("K");
    else setPriceUnit("FULL");
    setExistingImages(house.images || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await API.patch(`/rentals/${id}/availability`, {
        available: !currentStatus,
      });
      setLandlordHouses((prev) =>
        prev.map((h) =>
          h._id === id ? { ...h, available: !currentStatus } : h
        )
      );
      toast.success(
        !currentStatus
          ? "🏠 House marked as available"
          : "🚫 House marked as occupied"
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this house?")) return;
    try {
      await API.delete(`/rentals/${id}`);
      setLandlordHouses((prev) => prev.filter((h) => h._id !== id));
      toast.success("🗑️ House deleted successfully");
    } catch {
      toast.error("Failed to delete house");
    }
  };

  const loadMoreHouses = () => {
    if (page < totalPages) fetchMyHouses(page + 1, true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 sm:px-8 py-10">
      <div className="flex items-center justify-center gap-3 mb-10">
        <Home size={34} className="text-blue-500 drop-shadow-md" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Landlord Dashboard
        </h1>
      </div>

      {user?.firstPropertyPosted && user?.verification?.status !== "verified" && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-yellow-50 border border-yellow-400 text-yellow-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <p>⚠️ You’ve posted your first property. Please verify your identity to continue posting.</p>
          <button
            onClick={() => navigate("/verify")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Verify Identity
          </button>
        </div>
      )}


      <form
        onSubmit={handleSubmit}
       className={`bg-gray-800 border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto space-y-5 transition-all ${
          user?.firstPropertyPosted && user?.verification?.status !== "verified"
            ? "opacity-60 pointer-events-none"
            : ""
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
            placeholder="Property title"
            value={form.title}
            onChange={handleChange}
            required
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {/* Price + Unit Selector */}
          <div className="flex gap-2">
            <input
              type="number"
              name="price"
              placeholder="Asking Price"
              value={form.price}
              onChange={handleChange}
              required
              className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <select
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              className="w-20 p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="K">K</option>
              <option value="M">M</option>
              <option value="B">B</option>
              <option value="FULL">₦</option>
            </select>
          </div>
          <input
            type="number"
            name="area"
            placeholder="Area (sqft)"
            value={form.area}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            name="rooms"
            value={form.rooms}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i} Room{i !== 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            name="baths"
            value={form.baths}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i} Bath{i !== 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            name="toilets"
            value={form.toilets}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i} Toilet{i !== 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            name="parking"
            value={form.parking}
            onChange={handleChange}
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i} Parking{i !== 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition">
            <Upload size={18} className="text-blue-400" />
            <span className="text-gray-300">
              {images.length > 0
                ? `${images.length} new image${
                    images.length > 1 ? "s" : ""
                  } selected`
                : "Upload or add more images"}
            </span>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.negotiable}
            onChange={(val) => setForm((p) => ({ ...p, negotiable: val }))}
            className={`${
              form.negotiable ? "bg-blue-600" : "bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                form.negotiable ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-sm text-gray-300">Price negotiable</span>
        </div>

        {(existingImages.length > 0 || previewUrls.length > 0) && (
          <div className="flex flex-wrap gap-3 mt-5">
            {existingImages.map((url, i) => (
              <div
                key={`old-${i}`}
                className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-700"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeExistingImage(url);
                  }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}

            {previewUrls.map((url, i) => (
              <div
                key={`new-${i}`}
                className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-700"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeNewImage(i);
                  }}
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
            {uploading
              ? "Uploading..."
              : editing
              ? "Update House"
              : "Add House"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400"
            >
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        {loadingHouses ? (
          <p className="text-center text-gray-400">Loading houses...</p>
        ) : landlordHouses.length === 0 ? (
          <p className="text-center text-gray-400">No houses posted yet</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {landlordHouses.map((h) => (
                <div
                  key={h._id}
                  className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.01] transition-all"
                >
                  <img
                    src={
                      h.primaryImage ||
                      h.images?.[0] ||
                      "https://placehold.co/400x300?text=No+Image"
                    }
                    alt={h.title}
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                  />

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      {h.title}
                    </h3>

                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin size={14} /> {h.location}
                    </p>

                    <p className="text-green-400 font-semibold text-sm">
                        ₦{Number(h.price).toLocaleString()}
                        {h.priceUnit && (
                          <span className="text-gray-400 ml-1 uppercase">{h.priceUnit}</span>
                        )}
                      </p>

                    <p className="text-sm text-gray-400 line-clamp-2">
                      {h.description}
                    </p>

                    <div className="grid grid-cols-4 gap-3 text-gray-400 text-sm mt-4">
                      <div className="flex items-center gap-1">
                        <BedDouble size={14} /> {h.rooms || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={14} /> {h.baths || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Toilet size={14} /> {h.toilets || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Car size={14} /> {h.parking || 0}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`text-sm ${
                          h.available ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {h.available ? "Available" : "Occupied"}
                      </span>

                      <Switch
                        checked={h.available}
                        onChange={() =>
                          toggleAvailability(h._id, h.available)
                        }
                        className={`${
                          h.available ? "bg-green-500" : "bg-gray-600"
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      >
                        <span
                          className={`${
                            h.available ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
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

            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreHouses}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
