import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  editingCategory,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingCategory?.name || "",
        description: editingCategory?.description || "",
      });
      setImageFile(null);

      if (editingCategory?.imageURL) {
        const url = editingCategory.imageURL;
        setImagePreview(url.startsWith("http") ? url : `http://localhost:5008${url}`);
      } else {
        setImagePreview("");
      }

      setError("");
    }
  }, [isOpen, editingCategory]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Package into FormData for Multer middleware
      const data = new FormData();
      data.append("name", name);
      data.append("description", description);
      if (imageFile) {
        data.append("image", imageFile);
      }

      await onSave(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2
              id="category-modal-title"
              className="text-lg font-bold text-gray-800"
            >
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {editingCategory
                ? "Update the category details below."
                : "Enter the details for your new category."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category Name <span className="text-red-500">*</span>
              </label>

              <input
                id="category-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                maxLength={100}
                required
                autoFocus
                disabled={saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>

              <textarea
                id="category-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description (optional)"
                rows={3}
                maxLength={500}
                disabled={saving}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Category Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category Image
              </label>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-300" />
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={saving}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-bluely-50 file:text-bluely-600 hover:file:bg-bluely-100 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
              >
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
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-bluely-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bluely-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingCategory
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}