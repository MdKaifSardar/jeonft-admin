"use server";

import { connectToDatabase } from "../database/db";
import Deposit from "../models/depositModel";
import User from "../models/userModel";
import { getFirstAdminWallet } from "./adminwallet.actions";
import { convertRsToEth, getUserDetails } from "./user.actions";
import mongoose from "mongoose";

export const createDeposit = async (userId: string, amount: number, unit: "eth" | "rs") => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const userResponse = await getUserDetails(userId);
    if (!userResponse.success) {
      return { success: false, message: "User not found" };
    }

    if (!userResponse.user.walletId) {
      return { success: false, message: "No wallet connected" };
    }

    const adminWalletResponse = await getFirstAdminWallet();
    if (!adminWalletResponse.success || !adminWalletResponse.data || 
        (Array.isArray(adminWalletResponse.data) && !adminWalletResponse.data[0]?.walletAddress) ||
        (!Array.isArray(adminWalletResponse.data) && !adminWalletResponse.data.walletAddress)) {
      return { success: false, message: "Admin wallet address not configured" };
    }

    const deposit = new Deposit({
      amount, // Save the amount as provided
      userId: new mongoose.Types.ObjectId(userId),
      walletId: userResponse.user.walletId,
      adminWalletAddress: Array.isArray(adminWalletResponse.data) ? adminWalletResponse.data[0].walletAddress : adminWalletResponse.data.walletAddress,
      state: "pending",
      withdrawn: false,
      unit, // Save the unit as provided (eth or rs)
    }) as any;

    await deposit.save();

    return {
      success: true,
      message: "Deposit initiated successfully",
      data: {
        depositId: deposit._id.toString(),
        amount,
        unit, // Return the unit as provided
        adminWalletAddress: Array.isArray(adminWalletResponse.data) ? adminWalletResponse.data[0].walletAddress : adminWalletResponse.data.walletAddress,
      },
    };
  } catch (error: any) {
    console.error("Error creating deposit:", error);
    return { success: false, message: error.message };
  }
};

export const getDeposits = async (userId: string) => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID format." };
    }

    const deposits = await Deposit.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() to convert Mongoose Documents to plain objects

    const plainDeposits = deposits.map((deposit) => ({
      ...deposit,
      _id: deposit._id.toString(),
      userId: deposit.userId.toString(),
      walletId: deposit.walletId.toString(),
    }));

    return {
      success: true,
      message: "Deposits fetched successfully.",
      data: plainDeposits, // Ensure plain objects are returned
    };
  } catch (error: any) {
    console.error("Error fetching deposits:", error);
    return {
      success: false,
      message: "An error occurred while fetching deposits.",
      error: error.message || "Unknown error",
    };
  }
};

export const getAllDeposits = async () => {
  try {
    await connectToDatabase();
    const deposits = await Deposit.find({}).sort({ createdAt: -1 }).lean();
    // Convert to plain objects using JSON methods.
    const plainDeposits = JSON.parse(JSON.stringify(deposits)); // modified conversion
    return {
      success: true,
      message: "Deposits fetched successfully.",
      data: plainDeposits,
    };
  } catch (error: any) {
    console.error("Error fetching deposits:", error);
    return {
      success: false,
      message: "An error occurred while fetching deposits.",
      error: error.message || "Unknown error",
    };
  }
};

export const allowDeposit = async (depositId: string) => {
  try {
    await connectToDatabase();
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return { success: false, message: "Deposit not found" };
    }
    // Update deposit state to completed instead of deleting it
    deposit.state = "completed";
    await deposit.save();

    let amountToAdd = deposit.amount;

    // Convert amount to ETH if the unit is "rs"
    if (deposit.unit === "rs") {
      amountToAdd = await convertRsToEth(deposit.amount);
    }

    // Add deposit amount (converted if necessary) to user's balance
    await User.findByIdAndUpdate(deposit.userId.toString(), {
      $inc: { balance: amountToAdd },
    });

    return { success: true, message: "Deposit approved and balance updated" };
  } catch (error: any) {
    console.error("Error in allowDeposit:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};

export const rejectDeposit = async (depositId: string) => {
  try {
    await connectToDatabase();
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return { success: false, message: "Deposit not found" };
    }
    // Instead of deleting, update the state to failed
    deposit.state = "failed";
    await deposit.save();
    return { success: true, message: "Deposit rejected" };
  } catch (error: any) {
    console.error("Error in rejectDeposit:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};
