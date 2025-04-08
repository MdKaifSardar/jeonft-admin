"use server";

import { connectToDatabase } from "../database/db";
import Deposit from "../models/depositModel";
import User from "../models/userModel";
import { getUserDetails } from "./user.actions";
import mongoose from "mongoose";

export const createDeposit = async (userId: string, amount: number) => {
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

    const deposit = new Deposit({
      amount,
      userId: new mongoose.Types.ObjectId(userId),
      walletId: userResponse.user.walletId,
      adminWalletAddress: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
      state: "pending",
    }) as any;

    await deposit.save();

    return {
      success: true,
      message: "Deposit initiated successfully",
      data: {
        depositId: deposit._id.toString(),
        amount,
        adminWalletAddress: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS,
      },
    };
  } catch (error: any) {
    console.error("Error creating deposit:", error);
    return { success: false, message: error.message };
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
    // Add deposit amount to user's balance
    await User.findByIdAndUpdate(deposit.userId.toString(), { $inc: { balance: deposit.amount } });
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
