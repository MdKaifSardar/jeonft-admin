"use server";

import cloudinary from "cloudinary";
import { connectToDatabase } from "../database/db";
import NFT, { INFT } from "../models/nftModel";
import mongoose from "mongoose";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CreateNFTData {
  name: string;
  description: string;
  price: number;
  royalty: number;
  collectionName: string; // Mongoose ObjectId as a string
  image: File | null;
}

export const createNFT = async (nftData: CreateNFTData) => {
  try {
    await connectToDatabase();

    let image = { url: "", public_id: "" };

    // Upload image to Cloudinary if provided
    if (nftData.image) {
      const buffer = Buffer.from(await nftData.image.arrayBuffer());
      const uploadResult = await cloudinary.v2.uploader.upload(
        `data:${nftData.image.type};base64,${buffer.toString("base64")}`,
        { folder: "nft-images" }
      );
      image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    const nftObject: Partial<INFT> = {
      name: nftData.name,
      description: nftData.description,
      price: nftData.price,
      royalty: nftData.royalty,
      collectionName: new mongoose.Types.ObjectId(nftData.collectionName), // Convert string to ObjectId
      image,
    };

    // Save to MongoDB
    const nft = new NFT(nftObject);
    await nft.save();

    return { success: true, data: nft };
  } catch (error) {
    console.error("Error creating NFT:", error);
    return { success: false, error: "Failed to create NFT" };
  }
};

// Get all NFTs
export const getAllNFTs = async () => {
  try {
    await connectToDatabase();
    const nfts = await NFT.find();
    return { success: true, data: nfts };
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return { success: false, error: "Failed to fetch NFTs" };
  }
};

// Get NFT by ID
export const getNFTById = async (id: string) => {
  try {
    await connectToDatabase();
    const nft = await NFT.findById(id);
    if (!nft) {
      return { success: false, error: "NFT not found" };
    }
    return { success: true, data: nft };
  } catch (error) {
    console.error("Error fetching NFT:", error);
    return { success: false, error: "Failed to fetch NFT" };
  }
};

export const updateNFT = async (
  id: string,
  nftData: {
    name: string;
    description: string;
    price: number;
    royalty: number;
    collectionName: string; // Mongoose ObjectId as a string
    image?: File | null;
  }
) => {
  try {
    await connectToDatabase();

    const nft = await NFT.findById(id);
    if (!nft) {
      return { success: false, error: "NFT not found" };
    }

    let updatedImage = nft.image;

    // If a new image is provided, upload it and delete the old one
    if (nftData.image) {
      const buffer = Buffer.from(await nftData.image.arrayBuffer());
      const uploadResult = await cloudinary.v2.uploader.upload(
        `data:${nftData.image.type};base64,${buffer.toString("base64")}`,
        { folder: "nft-images" }
      );

      // Delete the old image from Cloudinary
      if (nft.image && nft.image.public_id) {
        await cloudinary.v2.uploader.destroy(nft.image.public_id);
      }

      updatedImage = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Update the NFT
    const updatedNFT = await NFT.findByIdAndUpdate(
      id,
      {
        ...nftData,
        image: updatedImage,
      },
      { new: true }
    );

    return { success: true, data: updatedNFT };
  } catch (error) {
    console.error("Error updating NFT:", error);
    return { success: false, error: "Failed to update NFT" };
  }
};

// Delete NFT
export const deleteNFT = async (id: string) => {
  try {
    await connectToDatabase();

    const nft = await NFT.findByIdAndDelete(id);
    if (!nft) {
      return { success: false, error: "NFT not found" };
    }

    // Delete image from Cloudinary
    if (nft.image && nft.image.public_id) {
      await cloudinary.v2.uploader.destroy(nft.image.public_id);
    }

    return { success: true, data: nft };
  } catch (error) {
    console.error("Error deleting NFT:", error);
    return { success: false, error: "Failed to delete NFT" };
  }
};
