"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import {
  createNFT,
  getAllNFTs,
  deleteNFT,
  updateNFT,
} from "@/lib/actions/nft.actions";
import { getAllCollections } from "@/lib/actions/collection.actions"; // Import collection fetch function
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/components/Loader";

// Interface for the form structure
interface NFT {
  name: string;
  description: string;
  price: string;
  royalty: string;
  collectionId: string; // Updated to store collection ID
  image: File | null;
}

// Interface for fetched NFTs (matches the NFT model)
interface FetchedNFT {
  _id: string;
  name: string;
  description: string;
  price: number;
  royalty: number;
  collectionName: string;
  image: {
    url: string;
    public_id: string;
  };
}

// Interface for fetched collections
interface FetchedCollection {
  _id: string;
  name: string;
}

const NFTUpload: React.FC = () => {
  const [nft, setNft] = useState<NFT>({
    name: "",
    description: "",
    price: "",
    royalty: "10",
    collectionId: "", // Updated to store collection ID
    image: null,
  });

  const [createPreview, setCreatePreview] = useState<string | null>(null); // Separate preview for creation
  const [editPreview, setEditPreview] = useState<string | null>(null); // Separate preview for editing
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nfts, setNfts] = useState<FetchedNFT[]>([]);
  const [collections, setCollections] = useState<FetchedCollection[]>([]); // State for collections
  const [editingNFTId, setEditingNFTId] = useState<string | null>(null);
  const [editingNFT, setEditingNFT] = useState<NFT | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  useEffect(() => {
    fetchNFTs();
    fetchCollections(); // Fetch collections on component mount
  }, []);

  const fetchNFTs = async () => {
    setIsLoading(true);
    try {
      const response = await getAllNFTs();
      if (response.success) {
        const formattedNFTs = response.data?.map((nft: any) => ({
          _id: nft._id.toString(),
          name: nft.name,
          description: nft.description,
          price: nft.price,
          royalty: nft.royalty,
          collectionName: nft.collectionName.toString(),
          image: nft.image
        }));
        setNfts(formattedNFTs || []);
      } else {
        toast.error("Failed to fetch NFTs.");
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await getAllCollections();
      if (response.success) {
        setCollections(response.data as FetchedCollection[]);
      } else {
        toast.error("Failed to fetch collections.");
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleCreateChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNft({ ...nft, [name]: value });
  };

  const handleCreateImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNft({ ...nft, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setCreatePreview(reader.result as string); // Update create preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editingNFT) {
      setEditingNFT({ ...editingNFT, [name]: value });
    }
  };

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && editingNFT) {
      setEditingNFT({ ...editingNFT, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreview(reader.result as string); // Update edit preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const response = await createNFT({
        name: nft.name,
        description: nft.description,
        price: parseFloat(nft.price),
        royalty: parseFloat(nft.royalty),
        collectionName: nft.collectionId, // Save collection ID
        image: nft.image,
      });

      if (response.success) {
        toast.success(`NFT "${nft.name}" uploaded successfully!`);
        setNft({
          name: "",
          description: "",
          price: "",
          royalty: "10",
          collectionId: "",
          image: null,
        });
        setCreatePreview(null);
        fetchNFTs();
      } else {
        toast.error(response.error || "Failed to create NFT.");
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (editingNFTId && editingNFT) {
        const response = await updateNFT(editingNFTId, {
          name: editingNFT.name,
          description: editingNFT.description,
          price: parseFloat(editingNFT.price),
          royalty: parseFloat(editingNFT.royalty),
          collectionName: editingNFT.collectionId, // Save collection ID
          image: editingNFT.image,
        });

        if (response.success) {
          toast.success(`NFT "${editingNFT.name}" updated successfully!`);
          setEditingNFTId(null);
          setEditingNFT(null);
          setEditPreview(null);
          fetchNFTs();
        } else {
          toast.error(response.error || "Failed to update NFT.");
        }
      }
    } catch (error) {
      console.error("Error updating NFT:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    const nftToEdit = nfts.find((nft) => nft._id === id);
    if (nftToEdit) {
      setEditingNFTId(id);
      setEditingNFT({
        name: nftToEdit.name,
        description: nftToEdit.description,
        price: nftToEdit.price.toString(),
        royalty: nftToEdit.royalty.toString(),
        collectionId: nftToEdit.collectionName, // Save collection ID
        image: null, // Reset image to force re-upload
      });
      setEditPreview(nftToEdit.image.url); // Set edit preview
    }
  };

  const handleCancelEdit = () => {
    setEditingNFTId(null);
    setEditingNFT(null);
    setEditPreview(null); // Clear edit preview
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setIsLoading(true);
    try {
      const response = await deleteNFT(deleteModalId);
      if (response.success) {
        toast.success("NFT deleted successfully!");
        fetchNFTs();
      } else {
        toast.error("Failed to delete NFT.");
      }
    } catch (error) {
      console.error("Error deleting NFT:", error);
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
          Create New NFT Asset
        </h3>
        <p className="text-sm text-blue-600">
          Upload and mint a new NFT to the marketplace
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              NFT Name
            </label>
            <input
              type="text"
              name="name"
              value={nft.name}
              onChange={handleCreateChange}
              className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter NFT name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={nft.description}
              onChange={handleCreateChange}
              rows={3}
              className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your NFT"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Price (ETH)
              </label>
              <input
                type="text"
                name="price"
                value={nft.price}
                onChange={handleCreateChange}
                className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.05"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Royalty %
              </label>
              <input
                type="text"
                name="royalty"
                value={nft.royalty}
                onChange={handleCreateChange}
                className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Collection
            </label>
            <select
              name="collectionId"
              value={nft.collectionId}
              onChange={handleCreateChange}
              className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="" disabled>
                Select a collection
              </option>
              {collections.map((collection) => (
                <option key={collection._id} value={collection._id}>
                  {collection.name}
                </option>
              ))}
            </select>
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
                required={!nft.image}
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
                  {nft.image
                    ? "Replace image"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="mt-1 text-xs text-blue-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>
          </div>

          {createPreview && (
            <div className="mt-5 text-center">
              <h4 className="font-medium text-blue-900">{nft.name}</h4>
              <img
                src={createPreview}
                alt="NFT Preview"
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
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Upload...
                </>
              ) : (
                "Mint NFT"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">All NFTs</h3>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {nfts.map((nft) => (
              <div
                key={nft._id}
                className="shadow-lg rounded-md p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-blue-900 font-medium">{nft.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(nft._id!)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModalId(nft._id!)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* <div className="mt-2">
                  <img
                    src={nft.image.url}
                    alt={nft.name}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div> */}
                {editingNFTId === nft._id && (
                  <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        NFT Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingNFT?.name || ""}
                        onChange={handleEditChange}
                        className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter NFT name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editingNFT?.description || ""}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your NFT"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Price (ETH)
                        </label>
                        <input
                          type="text"
                          name="price"
                          value={editingNFT?.price || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.05"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Royalty %
                        </label>
                        <input
                          type="text"
                          name="royalty"
                          value={editingNFT?.royalty || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Collection
                      </label>
                      <select
                        name="collectionId"
                        value={editingNFT?.collectionId || ""}
                        onChange={handleEditChange}
                        className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="" disabled>
                          Select a collection
                        </option>
                        {collections.map((collection) => (
                          <option key={collection._id} value={collection._id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
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
                          id="edit-file-upload"
                          required={!editingNFT?.image}
                        />
                        <label htmlFor="edit-file-upload" className="cursor-pointer">
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
                            {editingNFT?.image
                              ? "Replace image"
                              : "Click to upload or drag and drop"}
                          </p>
                          <p className="mt-1 text-xs text-blue-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </label>
                      </div>
                    </div>

                    {editPreview && (
                      <div className="mt-5 text-center">
                        <h4 className="font-medium text-blue-900">
                          {editingNFT?.name}
                        </h4>
                        <img
                          src={editPreview}
                          alt="Editing NFT Preview"
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
                        {isUploading ? "Updating..." : "Update NFT"}
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
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="text-lg font-medium text-gray-900">
              Are you sure you want to delete this NFT?
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

export default NFTUpload;
