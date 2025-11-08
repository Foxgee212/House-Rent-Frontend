import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHouses } from "../context/HouseContext";
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

export default function SellerDashboard() {
  const { user, token } = useAuth();
  const { mySales, fetchMySales, addSale, updateSale, deleteHouse } = useHouses();
  const navigate = useNavigate();

  const allowed = user?.role === "seller" || user?.role === "agent";

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    negotiable: false,
  });
  const [images, setImages] = useState([]); // New uploads
  const [existingImages, setExistingImages] = useState([]); // Existing images from listing
  const [previewUrls, setPreviewUrls] = useState([]); // Previews of new uploads
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (allowed && token) fetchMySales(token);
  }, [allowed, token, fetchMySales]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const compressed = await Promise.all(
      files.map(async (file) => {
        try {
          return await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
          });
        } catch {
          toast.error("Image compression failed");
          return null;
        }
      })
    );

    const valid = compressed.filter(Boolean);
    setImages((p) => [...p, ...valid]);
    setPreviewUrls((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const resetForm = () => {
    setForm({
      title: "",
      location: "",
      price: "",
      description: "",
      negotiable: false,
    });
    setImages([]);
    setExistingImages([]);
    setPreviewUrls([]);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editing && images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    if (user?.verification?.status !== "verified") {
      toast.error("You must verify your identity before posting properties");
      navigate("/verify");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, typeof v === "boolean" ? String(v) : v)
      );

      // Include new uploads
      images.forEach((img) => formData.append("images", img));

      // Include existing images (URLs/paths) to retain
      if (editing) {
        formData.append(
          "existingImages",
          JSON.stringify(existingImages) // send as JSON array
        );
      }

      if (editing) {
        await updateSale(editing._id, formData, token);
        toast.success("Listing updated");
      } else {
        await addSale(formData, token);
        toast.success("🏡 Property listed for sale");
      }

      resetForm();
      fetchMySales(token); // Refresh listings
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to process request";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (sale) => {
    setEditing(sale);
    setForm({
      title: sale.title,
      location: sale.location,
      price: sale.price,
      description: sale.description,
      negotiable: sale.negotiable || false,
    });
    setExistingImages(sale.images || []);
    setImages([]);
    setPreviewUrls([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const removeNewImage = (index) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await deleteHouse(id, token);
  };

  if (!allowed) {
    return (
      <div className="p-8 text-center text-gray-400">
        🚫 Access Denied — Sellers/Agents Only
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <Home size={34} className="text-blue-500 drop-shadow-md" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Seller Dashboard
        </h1>
      </div>

      {/* Verification Warning */}
      {user?.verification?.status !== "verified" && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-yellow-50 border border-yellow-400 text-yellow-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <p>
            ⚠️ Your account is not verified. Verify your identity to post
            properties for sale.
          </p>
          <button
            onClick={() => navigate("/verify")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Verify Identity
          </button>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`bg-gray-800 border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto space-y-5 transition-all ${
          user?.verification?.status !== "verified"
            ? "opacity-60 pointer-events-none"
            : ""
        }`}
      >
        <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
          {editing ? (
            <>
              <Edit3 size={20} /> Edit Listing
            </>
          ) : (
            <>
              <PlusCircle size={20} /> List a Property for Sale
            </>
          )}
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
          <input
            type="number"
            name="price"
            placeholder="Asking Price (₦)"
            value={form.price}
            onChange={handleChange}
            required
            className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {!editing && (
            <label className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition">
              <Upload size={18} className="text-blue-400" />
              <span className="text-gray-300">
                {images.length > 0
                  ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
                  : "Upload property images"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </label>
          )}
        </div>

        {/* Negotiable */}
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

        {/* Image Previews */}
        {(existingImages.length > 0 || previewUrls.length > 0) && (
          <div className="flex flex-wrap gap-3 mt-5">
            {existingImages.map((url, i) => (
              <div
                key={`existing-${i}`}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
            {previewUrls.map((url, i) => (
              <div
                key={`new-${i}`}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeNewImage(i)}
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
          placeholder="Short description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-700/30"
          >
            {uploading
              ? "Processing..."
              : editing
              ? "Update Listing"
              : "Add Listing"}
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

      {/* Seller listings */}
      <div className="mt-10 max-w-6xl mx-auto">
        {mySales.length === 0 ? (
          <p className="text-center text-gray-400">
            You have no properties listed for sale yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mySales.map((h) => (
              <div
                key={h._id}
                className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all"
              >
                <img
                  src={h.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                  alt={h.title}
                  className="w-full h-48 object-cover cursor-pointer"
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
