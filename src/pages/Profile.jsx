import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { MapPin, Mail, Phone, User, Save, Camera } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import 'react-phone-input-2/lib/style.css';
import API from "../api/axios";
import { nigeriaStatesAndLgas } from "../utils/nigeriaData"; // We'll create this small data file

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    localGovernment: "",
    bio: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Pre-fill user data
  useEffect(() => {
    if (user) {
      const [state, localGovernment] = (user.location || "").split(", ");
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        state: state || "",
        localGovernment: localGovernment || "",
        bio: user.bio || "",
      });
      setPreview(user.profilePic || null);
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectChange = (field, value) => setForm({ ...form, [field]: value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      const location = `${form.state}, ${form.localGovernment}`;
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("bio", form.bio);
      formData.append("location", location);
      if (profilePic) formData.append("profilePic", profilePic);

      const res = await API.put(`/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("❌ Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Convert states to react-select options
  const stateOptions = Object.keys(nigeriaStatesAndLgas).map((state) => ({
    value: state,
    label: state,
  }));

  const lgaOptions = form.state
    ? nigeriaStatesAndLgas[form.state]?.map((lga) => ({ value: lga, label: lga }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 relative">
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={preview || "/default-profile.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
            />
            <label
              htmlFor="profilePic"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
            >
              <Camera size={18} className="text-white" />
            </label>
            <input
              id="profilePic"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click the camera icon to change your picture
          </p>
        </div>

        {message && (
          <div
            className={`text-center mb-4 p-2 rounded-lg ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            icon={<User size={18} className="text-blue-600" />}
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          <InputField
            icon={<Mail size={18} className="text-blue-600" />}
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <PhoneInput
              country={"ng"}
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone })}
              inputClass="!w-full !p-3 !border !rounded-lg dark:!bg-gray-700 dark:!text-gray-100"
              buttonClass="!border-gray-300"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <Select
              options={stateOptions}
              value={form.state ? { value: form.state, label: form.state } : null}
              onChange={(option) => handleSelectChange("state", option.value)}
              placeholder="Select State"
              className="text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Local Government */}
          <div>
            <label className="block text-sm font-medium mb-1">Local Government</label>
            <Select
              options={lgaOptions}
              value={
                form.localGovernment
                  ? { value: form.localGovernment, label: form.localGovernment }
                  : null
              }
              onChange={(option) =>
                handleSelectChange("localGovernment", option.value)
              }
              placeholder="Select LGA"
              isDisabled={!form.state}
              className="text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Bio */}
          <textarea
            name="bio"
            placeholder="Short bio or additional info"
            value={form.bio}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ✅ Reusable Input Component
function InputField({ icon, ...props }) {
  return (
    <div className="flex items-center gap-2 border rounded-lg p-3 dark:bg-gray-700 dark:text-gray-100 focus-within:ring-2 focus-within:ring-blue-500">
      {icon}
      <input {...props} className="w-full bg-transparent focus:outline-none" />
    </div>
  );
}
