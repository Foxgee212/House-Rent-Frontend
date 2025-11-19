import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
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
  BedDouble,
  Bath,
  Toilet,
  Car,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import imageCompression from "browser-image-compression";

export default function SellerDashboard() {
  const { user } = useAuth();
  const { mySales, fetchMySales, deleteHouse } = useHouses();
  const navigate = useNavigate();
  const allowed = user?.role === "seller" || user?.role === "agent";

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    negotiable: false,
    rooms: "0",
    baths: "0",
    toilets: "0",
    parking: "0",
    area: "",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceUnit, setPriceUnit] = useState("M");

  const limit = 6;
  const fileInputRef = useRef(null);

  const fetchMyHousesData = async (pageNum = 1, append = false) => {
    setUploading(true);
    try {
      const res = await API.get(`/sales/my?page=${pageNum}&limit=${limit}`);
      const fetched = res.data?.houses || [];
      const total = res.data?.totalPages || 1;

      fetchMySales(append ? [...mySales, ...fetched] : fetched);
      setPage(pageNum);
      setTotalPages(total);
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.msg || err.message;
      if (message?.toLowerCase().includes("identity verification")) {
        toast.error("Please verify your identity to view your properties");
      } else {
        toast.error("Failed to load your listings");
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchMyHousesData();
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const loadMoreHouses = () => {
    if (page < totalPages) {
      fetchMyHousesData(page + 1, true);
    }
  };

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
    setImages((prev) => [...prev, ...valid]);
    setPreviewUrls((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) setPrimaryImageIndex(null);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

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
      Object.entries(updatedForm).forEach(([k, v]) =>
        formData.append(k, typeof v === "boolean" ? String(v) : v)
      );

      images.forEach((img) => formData.append("images", img));
      if (primaryImageIndex !== null) formData.append("primaryImageIndex", primaryImageIndex);

      const res = editing
        ? await API.put(`/sales/${editing._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await API.post("/sales", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      fetchMySales(
        editing
          ? mySales.map((h) =>
              h._id === editing._id ? res.data.house || res.data : h
            )
          : [res.data.house, ...mySales]
      );

      toast.success(editing ? "✅ Property updated!" : "🏠 Property added!");
      setForm({
        title: "",
        location: "",
        price: "",
        description: "",
        negotiable: false,
        rooms: "0",
        baths: "0",
        toilets: "0",
        parking: "0",
        area: "",
      });
      setImages([]);
      setPreviewUrls([]);
      setEditing(null);
      setExistingImages([]);
      setPrimaryImageIndex(null);
    } catch (error) {
      console.error("Error uploading property:", error);
      toast.error("Something went wrong while uploading");
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
      rooms: sale.rooms || "0",
      baths: sale.baths || "0",
      toilets: sale.toilets || "0",
      parking: sale.parking || "0",
      area: sale.area || "",
    });
    // Auto-detect unit when editing
    if (sale.price >= 1_000_000_000) setPriceUnit("B");
    else if (sale.price >= 1_000_000) setPriceUnit("M");
    else if (sale.price >= 1_000) setPriceUnit("K");
    else setPriceUnit("FULL");

    setExistingImages(sale.images || []);
    setImages([]);
    setPreviewUrls([]);
    setPrimaryImageIndex(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await deleteHouse(id);
    fetchMyHousesData();
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
      <div className="flex items-center justify-center gap-3 mb-10">
        <Home size={34} className="text-blue-500 drop-shadow-md" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Seller Dashboard
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


      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`bg-gray-800 border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto space-y-5 transition-all ${
          user?.firstPropertyPosted && user?.verification?.status !== "verified"
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
          <input type="text" name="title" placeholder="Property title" value={form.title} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
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

          <input type="number" name="area" placeholder="Area (sqft)" value={form.area} onChange={handleChange} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />

          {/* Dropdowns */}
          <select name="rooms" value={form.rooms} onChange={handleChange} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} Room{i !== 1 ? "s" : ""}</option>)}
          </select>
          <select name="baths" value={form.baths} onChange={handleChange} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} Bath{i !== 1 ? "s" : ""}</option>)}
          </select>
          <select name="toilets" value={form.toilets} onChange={handleChange} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} Toilet{i !== 1 ? "s" : ""}</option>)}
          </select>
          <select name="parking" value={form.parking} onChange={handleChange} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} Parking{i !== 1 ? "s" : ""}</option>)}
          </select>

        
            <label className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-800 transition">
              <Upload size={18} className="text-blue-400" />
              <span className="text-gray-300">
                {images.length > 0 ? `${images.length} image${images.length > 1 ? "s" : ""} selected` : "Upload property images"}
              </span>
              <input ref={fileInputRef} type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*" />
            </label>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={form.negotiable} onChange={(val) => setForm((p) => ({ ...p, negotiable: val }))} className={`${form.negotiable ? "bg-blue-600" : "bg-gray-600"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
            <span className={`${form.negotiable ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
          <span className="text-sm text-gray-300">Price negotiable</span>
        </div>

        {(existingImages.length > 0 || previewUrls.length > 0) && (
          <div className="flex flex-wrap gap-3 mt-5">
            {existingImages.map((url, i) => (
              <div key={`existing-${i}`} className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 ${primaryImageIndex === i ? "border-blue-500 shadow-md shadow-blue-500/30" : "border-gray-700"}`} onClick={() => setPrimaryImageIndex(i)}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removeExistingImage(url); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition">
                  <XCircle size={14} />
                </button>
                {primaryImageIndex === i && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-md">Primary</span>}
              </div>
            ))}
            {previewUrls.map((url, i) => (
              <div key={`new-${i}`} className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 ${primaryImageIndex === i + existingImages.length ? "border-blue-500 shadow-md shadow-blue-500/30" : "border-gray-700"}`} onClick={() => setPrimaryImageIndex(i + existingImages.length)}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); removeNewImage(i); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition">
                  <XCircle size={14} />
                </button>
                {primaryImageIndex === i + existingImages.length && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-md">Primary</span>}
              </div>
            ))}
          </div>
        )}

        <textarea name="description" placeholder="Short description" value={form.description} onChange={handleChange} rows="3" required className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />

        <div className="flex gap-3 flex-wrap">
          <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-700/30">
            {uploading ? "Processing..." : editing ? "Update Listing" : "Add Listing"}
          </button>
          {editing && (
            <button type="button" onClick={() => window.location.reload()} className="flex items-center gap-2 text-gray-400 hover:text-blue-400">
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Listings */}
      <div className="mt-10 max-w-6xl mx-auto">
        {!mySales || mySales.length === 0 ? (
          <p className="text-center text-gray-400">
            {mySales ? "You have no properties listed for sale yet." : "Loading your listings..."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mySales.map((h) => (
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all">
                    <img src={h.primaryImage || h.images?.[0] || "https://placehold.co/600x400?text=No+Image"} alt={h.title} className="w-full h-48 object-cover cursor-pointer" />
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-lg text-white">{h.title}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={14} /> {h.location}</p>
                      <p className="text-green-400 font-semibold text-sm">
                        ₦{Number(h.price).toLocaleString()}
                        {h.priceUnit && (
                          <span className="text-gray-400 ml-1 uppercase">{h.priceUnit}</span>
                        )}
                      </p>


                      <div className="grid grid-cols-4 gap-3 text-gray-400 text-sm mt-4">
                        <div className="flex items-center gap-1"><BedDouble size={14} /> {h.rooms || 0}</div>
                        <div className="flex items-center gap-1"><Bath size={14} /> {h.baths || 0}</div>
                        <div className="flex items-center gap-1"><Toilet size={14} /> {h.toilets || 0}</div>
                        <div className="flex items-center gap-1"><Car size={14} /> {h.parking || 0}</div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <button onClick={() => startEditing(h)} className="text-blue-400 hover:text-blue-500 flex items-center gap-1 text-sm"><Edit3 size={14} /> Edit</button>
                        <button onClick={() => handleDelete(h._id)} className="text-red-400 hover:text-red-500 flex items-center gap-1 text-sm"><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  </div>
              
              ))}
            </div>

            {totalPages > 1 && page < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreHouses}
                  className="bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 px-6 py-2 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {uploading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
