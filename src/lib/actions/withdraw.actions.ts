"use server";

import { connectToDatabase } from "../database/db";
import User from "../models/userModel";
import Withdraw, { IWithdraw } from "../models/withdrawModel";
import mongoose, { Document } from "mongoose";
import { getFirstAdminWallet } from "./adminwallet.actions";
import { convertRsToEth } from "./user.actions";

export const createWithdraw = async (
  depositId: string,
  userId: string,
  walletId: string,
  amount: number,
  unit: "eth" | "rs" // Accept unit as a parameter
) => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(depositId)) {
      return { success: false, message: "Invalid deposit ID." };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID." };
    }
    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return { success: false, message: "Invalid wallet ID." };
    }

    const adminWalletResponse = await getFirstAdminWallet();
    const adminWallet = Array.isArray(adminWalletResponse.data)
      ? adminWalletResponse.data[0]
      : adminWalletResponse.data;
    if (!adminWalletResponse.success || !adminWallet?.walletAddress) {
      return { success: false, message: "Admin wallet address not configured" };
    }

    const existingWithdraw = await Withdraw.findOne({ depositId: depositId });
    if (existingWithdraw && existingWithdraw.state !== "failed") {
      return {
        success: false,
        message: "A withdraw already exists for this deposit and is not failed.",
      };
    }

    const withdraw = new Withdraw({
      amount, // Use the amount passed as a parameter
      unit, // Use the unit passed as a parameter
      userId: new mongoose.Types.ObjectId(userId),
      walletId: new mongoose.Types.ObjectId(walletId),
      adminWalletAddress: adminWallet.walletAddress, // Use fetched admin wallet address
      state: "pending",
      depositId: new mongoose.Types.ObjectId(depositId),
    }) as Document<unknown, object, IWithdraw> & IWithdraw & { _id: mongoose.Types.ObjectId };

    await withdraw.save();

    return {
      success: true,
      message: "Withdraw created successfully.",
      data: {
        withdrawId: withdraw._id.toString(),
      },
    };
  } catch (error: any) {
    console.error("Error creating withdraw:", error);
    return { success: false, message: error.message || "Error creating withdraw." };
  }
};

export const getAllWithdraws = async () => {
  try {
    await connectToDatabase();
    const withdraws = await Withdraw.find({}).sort({ createdAt: -1 }).lean();
    // Convert to plain objects using JSON methods.
    const plainWithdraws = JSON.parse(JSON.stringify(withdraws)); // modified conversion
    return {
      success: true,
      message: "Withdraws fetched successfully.",
      data: plainWithdraws,
    };
  } catch (error: any) {
    console.error("Error fetching withdraws:", error);
    return {
      success: false,
      message: "An error occurred while fetching withdraws.",
      error: error.message || "Unknown error",
    };
  }
};

export const rejectWithdraw = async (withdrawId: string) => {
  try {
    await connectToDatabase();
    const withdraw = await Withdraw.findById(withdrawId);
    if (!withdraw) {
      return { success: false, message: "Withdraw not found" };
    }
    // Update state to failed
    withdraw.state = "failed";
    await withdraw.save();
    return { success: true, message: "Withdraw rejected" };
  } catch (error: any) {
    console.error("Error in rejectWithdraw:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};

export const allowWithdraw = async (withdrawId: string) => {
  try {
    await connectToDatabase();
    const withdraw = await Withdraw.findById(withdrawId);
    if (!withdraw) {
      return { success: false, message: "Withdraw not found" };
    }

    // Check if user exists from the userId stored in the withdraw record.
    const user = await User.findById(withdraw.userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    let amountToDeduct = withdraw.amount;

    // Convert amount to ETH if the unit is "rs"
    if (withdraw.unit === "rs") {
      amountToDeduct = await convertRsToEth(withdraw.amount);
    }

    // Deduct the withdraw amount (converted if necessary) from the user's balance and totalBalance.
    user.balance = (user.balance || 0) - amountToDeduct;
    user.totalBalance = (user.totalBalance || 0) - amountToDeduct;

    // If balance becomes zero, set totalIncome and referralIncome to zero.
    if (user.balance <= 0) {
      user.balance = 0;
      user.incomeAmount = 0;
      user.referralIncome = 0;
    }

    await user.save();

    // Set withdraw state to "completed"
    withdraw.state = "completed";
    await withdraw.save();

    // Update the corresponding deposit's withdrawn field to true
    try {
      const deposit = await mongoose.model("Deposit").findById(withdraw.depositId);
      if (!deposit) {
        throw new Error("Associated deposit not found");
      }
      deposit.withdrawn = true;
      await deposit.save();
    } catch (error: any) {
      console.error("Error updating deposit withdrawn field:", error);
      return { success: false, message: "Failed to update deposit withdrawn field." };
    }

    return { success: true, message: "Withdraw approved and processed" };
  } catch (error: any) {
    console.error("Error in allowWithdraw:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};
