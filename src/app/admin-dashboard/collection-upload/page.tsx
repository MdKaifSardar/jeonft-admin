"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import {
  createCollection,
  getAllCollections,
  deleteCollection,
  updateCollection,
} from "@/lib/actions/collection.actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/components/Loader";

interface Collection {
  _id?: string;
  name: string;
  image: File | null | { url: string };
}

const CollectionUpload: React.FC = () => {
  const [collection, setCollection] = useState<Collection>({
    name: "",
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null
  );
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [editingPreview, setEditingPreview] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCollections();
      if (response.success) {
        setCollections(
          response.data?.map((item) => ({
            _id: String(item._id),
            name: item.name,
            image: item.image,
          })) || []
        );
      } else {
        toast.error("Failed to fetch collections.");
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCollection({ ...collection, [name]: value });
  };

  const handleCreateImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setCollection({ ...collection, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCollection) {
      setEditingCollection({ ...editingCollection, [name]: value });
    }
  };

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && editingCollection) {
      setEditingCollection({ ...editingCollection, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const response = await createCollection({
        name: collection.name,
        image: collection.image instanceof File ? collection.image : null,
      });

      if (response.success) {
        toast.success(`Collection "${collection.name}" uploaded successfully!`);
        setCollection({ name: "", image: null });
        setPreview(null);
        fetchCollections();
      } else {
        toast.error(response.error || "Failed to create collection.");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (editingCollectionId && editingCollection) {
        const response = await updateCollection(editingCollectionId, {
          name: editingCollection.name,
          image:
            editingCollection.image instanceof File
              ? editingCollection.image
              : null,
        });

        if (response.success) {
          toast.success(
            `Collection "${editingCollection.name}" updated successfully!`
          );
          setEditingCollectionId(null);
          setEditingCollection(null);
          setEditingPreview(null);
          fetchCollections();
        } else {
          toast.error(response.error || "Failed to update collection.");
        }
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    const collectionToEdit = collections.find((col) => col._id === id);
    if (collectionToEdit) {
      setEditingCollectionId(id);
      setEditingCollection({
        name: collectionToEdit.name,
        image: null, // Reset image to force re-upload
      });
      setEditingPreview(
        collectionToEdit.image &&
          typeof collectionToEdit.image === "object" &&
          "url" in collectionToEdit.image
          ? collectionToEdit.image.url
          : null
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingCollectionId(null);
    setEditingCollection(null);
    setEditingPreview(null);
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setIsLoading(true);
    try {
      const response = await deleteCollection(deleteModalId);
      if (response.success) {
        toast.success("Collection deleted successfully!");
        fetchCollections();
      } else {
        toast.error("Failed to delete collection.");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setDeleteModalId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <ToastContainer />
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-blue-900">
          Create New Collection
        </h3>
        <p className="text-sm text-blue-600">
          Upload and create a new collection for the marketplace
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Collection Name
            </label>
            <input
              type="text"
              name="name"
              value={collection.name}
              onChange={handleCreateChange}
              className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter collection name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Upload Image
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-md p-6 text-center hover:bg-blue-50 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleCreateImageChange}
                className="hidden"
                id="file-upload"
                required={!collection.image}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <svg
                  className="mx-auto h-12 w-12 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <p className="mt-1 text-sm text-blue-600">
                  {collection.image
                    ? "Replace image"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="mt-1 text-xs text-blue-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>
          </div>

          {preview && (
            <div className="mt-5 text-center">
              <h4 className="font-medium text-blue-900">{collection.name}</h4>
              <img
                src={preview}
                alt="Collection Preview"
                className="w-64 h-64 object-cover rounded-md shadow-md"
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full flex justify-center items-center p-3 border border-transparent rounded-md shadow-sm text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isUploading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Saving..." : "Create Collection"}
            </button>
          </div>
        </form>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          All Collections
        </h3>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="shadow-lg rounded-md p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-blue-900 font-medium">
                    {collection.name}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(collection._id!)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModalId(collection._id!)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* <div className="mt-2">
                  <img
                    src={
                      collection.image &&
                      typeof collection.image === "object" &&
                      "url" in collection.image
                        ? collection.image.url
                        : ""
                    }
                    alt={collection.name}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div> */}
                {editingCollectionId === collection._id && (
                  <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Collection Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingCollection?.name || ""}
                        onChange={handleEditChange}
                        className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter collection name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Upload Image
                      </label>
                      <div className="border-2 border-dashed border-blue-300 rounded-md p-6 text-center hover:bg-blue-50 transition cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="hidden"
                          id={`file-upload-${collection._id}`}
                        />
                        <label
                          htmlFor={`file-upload-${collection._id}`}
                          className="cursor-pointer"
                        >
                          <svg
                            className="mx-auto h-12 w-12 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                          <p className="mt-1 text-sm text-blue-600">
                            {editingCollection?.image
                              ? "Replace image"
                              : "Click to upload or drag and drop"}
                          </p>
                          <p className="mt-1 text-xs text-blue-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </label>
                      </div>
                    </div>

                    {editingPreview && (
                      <div className="mt-5 text-center">
                        <h4 className="font-medium text-blue-900">
                          {editingCollection?.name}
                        </h4>
                        <img
                          src={editingPreview}
                          alt="Editing Collection Preview"
                          className="w-64 h-64 object-cover rounded-md shadow-md"
                        />
                      </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className={`px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 ${
                          isUploading ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {isUploading ? "Updating..." : "Update Collection"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="text-lg font-medium text-gray-900">
              Are you sure you want to delete this collection?
            </h3>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionUpload;
