import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Folders } from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";

import CategoryModal from "../../components/admin/modals/CategoryModal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all categories from the backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();
      const responseData = response?.data !== undefined ? response.data : response;

      const categoryList = Array.isArray(responseData)
        ? responseData
        : responseData?.categories || responseData?.data;

      if (!Array.isArray(categoryList)) {
        throw new Error(
          "The server returned an invalid categories response."
        );
      }

      setCategories(categoryList);
    } catch (err) {
      console.error("Error fetching categories:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Create or update category with FormData
  const handleSave = async (formData) => {
    try {
      setError("");
      setSuccessMessage("");

      if (editingCategory?._id) {
        await updateCategory(editingCategory._id, formData);
      } else {
        await createCategory(formData);
      }

      setIsModalOpen(false);
      setEditingCategory(null);

      setSuccessMessage(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully."
      );

      await fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save category. Please try again."
      );

      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError("Category ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");

      await deleteCategory(id);

      setSuccessMessage("Category deleted successfully.");

      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete category. Please try again."
      );
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `http://localhost:5008${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Product Categories
          </h2>

          <p className="text-xs text-gray-500">
            Organize cleaning solutions into structured categories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          className="bg-bluely-500 hover:bg-bluely-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <p className="text-sm text-gray-500">
          Loading categories...
        </p>
      )}

      {/* Category Grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const imgSrc = getImageUrl(cat.imageURL);
            return (
              <div
                key={cat._id || cat.name}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                          Img
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">
                          {cat.name}
                        </h3>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                          {cat.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditCategory(cat)}
                        title="Edit category"
                        aria-label={`Edit ${cat.name}`}
                        className="text-gray-400 hover:text-bluely-600"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(cat._id)}
                        title="Delete category"
                        aria-label={`Delete ${cat.name}`}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-bluely-600 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Folders size={14} /> Active Category Group
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && !error && (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
          <Folders
            size={32}
            className="mx-auto text-gray-300 mb-3"
          />

          <h3 className="text-base font-semibold text-gray-700">
            No categories found
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Click Add Category to create your first category.
          </p>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isModalOpen) return;

          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        editingCategory={editingCategory}
      />
    </div>
  );
}