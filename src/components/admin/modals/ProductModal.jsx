import React, { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { resolveImageUrl } from "../../../utils/format";

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  categories = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    litre: "", // Added volume/litre field
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingProduct?.name || "",
        category: editingProduct?.category?._id || editingProduct?.category || "",
        price: editingProduct?.price || "",
        stock: editingProduct?.stock || "",
        litre: editingProduct?.litre || "",
      });
      setImageFile(null);
      setImagePreview(editingProduct?.imageURL || editingProduct?.image || "");
      setError("");
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Construct FormData for multipart/form-data upload
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("litre", formData.litre.trim()); // Append volume/litre
      
      if (imageFile) {
        data.append("image", imageFile); // Must match multer .single("image")
      }

      await onSave(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {editingProduct
                ? "Update the product details and image below."
                : "Enter the details and upload an image for your new product."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {/* Product Name */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50 bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Volume / Litre */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Volume / Litre (e.g., 1L, 500ml)
              </label>
              <input
                type="text"
                name="litre"
                value={formData.litre}
                onChange={handleChange}
                placeholder="e.g. 1L"
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Image File Upload */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Product Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-gray-200 bg-slate-50 p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                    <img
                      src={resolveImageUrl(imagePreview)}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/Product.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 text-gray-400">
                    <ImageIcon size={22} className="mb-0.5 text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-medium">No Image</span>
                  </div>
                )}
                <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-bluely-500 hover:bg-bluely-50/20 transition bg-gray-50">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 font-medium">
                    {imageFile ? imageFile.name : "Click to upload image file"}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP</span>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-bluely-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-bluely-600 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}