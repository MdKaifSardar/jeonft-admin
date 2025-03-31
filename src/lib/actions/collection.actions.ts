"use server";

import cloudinary from "cloudinary";
import { connectToDatabase } from "../database/db";
import Collection, { ICollection } from "../models/collectionModel";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CreateCollectionData {
  name: string;
  image: File | null;
}

// Create Collection
export const createCollection = async (collectionData: CreateCollectionData) => {
  try {
    await connectToDatabase();

    let image = { url: "", public_id: "" };

    // Upload image to Cloudinary if provided
    if (collectionData.image) {
      const buffer = Buffer.from(await collectionData.image.arrayBuffer());
      const uploadResult = await cloudinary.v2.uploader.upload(
        `data:${collectionData.image.type};base64,${buffer.toString("base64")}`,
        { folder: "collection-images" }
      );
      image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Construct Collection data object
    const collectionObject: Partial<ICollection> = {
      name: collectionData.name,
      image,
    };

    // Save to MongoDB
    const collection = new Collection(collectionObject);
    await collection.save();

    return { success: true, data: collection };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { success: false, error: "Failed to create collection" };
  }
};

// Get All Collections
export const getAllCollections = async () => {
  try {
    await connectToDatabase();
    const collections = await Collection.find();
    return { success: true, data: collections };
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { success: false, error: "Failed to fetch collections" };
  }
};

// Get Collection by ID
export const getCollectionById = async (id: string) => {
  try {
    await connectToDatabase();
    const collection = await Collection.findById(id);
    if (!collection) {
      return { success: false, error: "Collection not found" };
    }
    return { success: true, data: collection };
  } catch (error) {
    console.error("Error fetching collection:", error);
    return { success: false, error: "Failed to fetch collection" };
  }
};

// Update Collection
export const updateCollection = async (
  id: string,
  collectionData: { name: string; image?: File | null }
) => {
  try {
    await connectToDatabase();

    const collection = await Collection.findById(id);
    if (!collection) {
      return { success: false, error: "Collection not found" };
    }

    let updatedImage = collection.image;

    // If a new image is provided, upload it and delete the old one
    if (collectionData.image) {
      const buffer = Buffer.from(await collectionData.image.arrayBuffer());
      const uploadResult = await cloudinary.v2.uploader.upload(
        `data:${collectionData.image.type};base64,${buffer.toString("base64")}`,
        { folder: "collection-images" }
      );

      // Delete the old image from Cloudinary
      if (collection.image && collection.image.public_id) {
        await cloudinary.v2.uploader.destroy(collection.image.public_id);
      }

      updatedImage = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Update the collection
    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      { name: collectionData.name, image: updatedImage },
      { new: true }
    );

    return { success: true, data: updatedCollection };
  } catch (error) {
    console.error("Error updating collection:", error);
    return { success: false, error: "Failed to update collection" };
  }
};

// Delete Collection
export const deleteCollection = async (id: string) => {
  try {
    await connectToDatabase();

    const collection = await Collection.findByIdAndDelete(id);
    if (!collection) {
      return { success: false, error: "Collection not found" };
    }

    // Delete image from Cloudinary
    if (collection.image && collection.image.public_id) {
      await cloudinary.v2.uploader.destroy(collection.image.public_id);
    }

    return { success: true, data: collection };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
};
