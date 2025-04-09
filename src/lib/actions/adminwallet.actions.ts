"use server";
import { connectToDatabase } from "../database/db";
import AdminWallet from "../models/adminwalletModel";

// Updated createAdminWallet to include walletBalance and walletNetwork
export const createAdminWallet = async (
  walletAddress: string,
  walletBalance: number,
  walletNetwork: string
) => {
  try {
    await connectToDatabase();
    const existing = await AdminWallet.findOne({ walletAddress });
    if (existing) {
      return { success: true, message: "Wallet already exists", data: existing };
    }
    const adminWallet = new AdminWallet({ walletAddress, walletBalance, walletNetwork, connected: true });
    await adminWallet.save();
    return { success: true, message: "Admin wallet created successfully", data: adminWallet };
  } catch (error: any) {
    console.error("Error creating admin wallet:", error);
    return { success: false, message: error.message };
  }
};

// New function to delete all admin wallets
export const deleteAdminWallets = async () => {
  try {
    await connectToDatabase();
    await AdminWallet.deleteMany({});
    return { success: true, message: "All admin wallets deleted" };
  } catch (error: any) {
    console.error("Error deleting admin wallets:", error);
    return { success: false, message: error.message };
  }
};

// New function to fetch admin wallet details
export const fetchAdminWallet = async () => {
  try {
    await connectToDatabase();
    const adminWallet = await AdminWallet.findOne({}).lean();
    if (!adminWallet) {
      return { success: false, message: "No admin wallet found" };
    }
    return { success: true, data: adminWallet };
  } catch (error: any) {
    console.error("Error fetching admin wallet:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};

export const getFirstAdminWallet = async () => {
  try {
    await connectToDatabase();
    const adminWallet = await AdminWallet.findOne({}).sort({ createdAt: -1 }).lean();
    if (!adminWallet) {
      return { success: false, message: "No admin wallet found" };
    }
    return { success: true, data: adminWallet };
  } catch (error: any) {
    console.error("Error fetching latest admin wallet:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};
