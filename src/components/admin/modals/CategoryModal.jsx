
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingCategory?.name || "",
        description: editingCategory?.description || "",
      });

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

      await onSave({
        name,
        description,
      });
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
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
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
                rows={4}
                maxLength={500}
                disabled={saving}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-bluely-500 focus:ring-2 focus:ring-bluely-100 disabled:bg-gray-50"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {formData.description.length}/500 characters
              </p>
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
