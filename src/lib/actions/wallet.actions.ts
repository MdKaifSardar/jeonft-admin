"use server";

import Wallet from "@/lib/models/walletModel";
import mongoose from "mongoose";
import { connectToDatabase } from "../database/db";
import { ETHEREUM_MAINNET } from "@/constants/networks";

const serializeWallet = (wallet: any) => {
  if (!wallet) return null;
  const plainWallet = wallet.toObject ? wallet.toObject() : wallet;
  
  return {
    ...plainWallet,
    _id: plainWallet._id.toString(),
    userId: plainWallet.userId?.toString(),
    balance: parseFloat(plainWallet.balance.toString()).toFixed(4),
    network: plainWallet.network,
    chainId: plainWallet.chainId,
    createdAt: plainWallet.createdAt?.toISOString?.() || plainWallet.createdAt,
    updatedAt: plainWallet.updatedAt?.toISOString?.() || plainWallet.updatedAt
  };
};

export const createWallet = async (
  userId: string,
  address: string,
  balance: number,
  network: string
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user ID" };
    }

    // Force Ethereum mainnet values
    const wallet = new Wallet({
      userId,
      address,
      balance: parseFloat(balance.toString()),
      network: ETHEREUM_MAINNET.name,
      chainId: ETHEREUM_MAINNET.chainId,
      symbol: ETHEREUM_MAINNET.symbol
    });

    await wallet.save();
    return { 
      success: true, 
      wallet: serializeWallet(wallet), 
      message: "Wallet created successfully" 
    };
  } catch (error: any) {
    console.error("Error creating wallet:", error.message);
    return { success: false, error: error.message };
  }
};

export const getWalletById = async (walletId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return { success: false, error: "Invalid wallet ID format" };
    }

    const wallet = await Wallet.findById(walletId)
      .select('address balance tokenBalance network transactionCount')
      .lean();

    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }

    return {
      success: true,
      data: serializeWallet(wallet)
    };
  } catch (error: any) {
    console.error("Error fetching wallet:", error.message);
    return { success: false, error: "Failed to fetch wallet details" };
  }
};

export async function updateWalletDetails(
  userId: string,
  address: string,
  balance: number,
  network: string
) {
  try {
    await connectToDatabase();
    
    const existingWallet = await Wallet.findOne({ 
      userId,
      address: address.toLowerCase()
    });

    if (existingWallet) {
      // Update existing wallet
      const updatedWallet = await Wallet.findOneAndUpdate(
        { userId, address: address.toLowerCase() },
        {
          $set: {
            balance,
            network,
            [`networks.${network.toLowerCase().split(' ')[0]}`]: {
              balance,
              address: address.toLowerCase()
            },
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      return { success: true, wallet: updatedWallet, message: "Wallet updated successfully" };
    }

    return { success: false, error: "Wallet not found" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getWalletAddressById = async (walletId: string) => {
  try {
    await connectToDatabase();
    const wallet = await Wallet.findById(walletId).lean();
    if (!wallet) {
      return { success: false, message: "Wallet not found" };
    }
    return { success: true, data: { walletAddress: wallet.address } };
  } catch (error: any) {
    console.error("Error fetching wallet address:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};
