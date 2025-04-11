"use server";

import User from "@/lib/models/userModel";
import { IUser } from "../models/userModel";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/database/db";
import { Types } from "mongoose";
import { verifyToken } from "@/utils/jwt";
import { getCookie } from "cookies-next";
import { hashPassword } from "@/utils/bcrypt";
import mongoose from "mongoose";
import Reward from "../models/rewardModel";
import axios from "axios";

const serializeUser = (user: any) => {
  if (!user) return null;
  const plainUser = user.toObject ? user.toObject() : user;

  return {
    ...plainUser,
    _id: plainUser._id.toString(),
    walletId: plainUser.walletId ? plainUser.walletId.toString() : null,
    createdAt: plainUser.createdAt?.toISOString?.() || plainUser.createdAt,
    updatedAt: plainUser.updatedAt?.toISOString?.() || plainUser.updatedAt,
  };
};

export const createUser = async (userData: Partial<IUser>) => {
  const { email, username, password, referralCode } = userData;

  if (!email || !username || !password) {
    throw new Error("Missing required fields: email, username, or password.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    username,
    password: hashedPassword,
    referralCode,
  });

  return await newUser.save();
};

export const getUserById = async (userId: string) => {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }
    return { success: true, data: serializeUser(user) };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user." };
  }
};

export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email }).populate("walletId");
  return user ? serializeUser(user) : null;
};

export const updateUser = async (
  userId: string,
  updateData: Partial<IUser>
) => {
  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!updatedUser) {
      return { success: false, error: "User not found." };
    }
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user." };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return { success: false, error: "User not found." };
    }
    return { success: true, data: deletedUser };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user." };
  }
};

export const verifyPassword = async (
  inputPassword: string,
  storedPassword: string
) => {
  return await bcrypt.compare(inputPassword, storedPassword);
};

export const getUserFromToken = async (req: any) => {
  try {
    await connectToDatabase();

    const token = getCookie("token", { req });
    if (!token) {
      return { success: false, error: "No token found in cookies." };
    }

    const decoded: any = verifyToken(token as string);
    const user = await User.findById(decoded.id).populate("walletId");

    if (!user) {
      return { success: false, error: "User not found." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user from token:", error);
    return { success: false, error: "Failed to fetch user from token." };
  }
};

export const getUserDetails = async (userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
      throw new Error("User not found");
    }

    return { success: true, user: serializeUser(user) };
  } catch (error: any) {
    console.error("Error fetching user details:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateUsername = async (userId: string, newUsername: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true }
    ).select("-password"); // Exclude password

    if (!user) {
      throw new Error("User not found");
    }

    return { success: true, user: serializeUser(user) };
  } catch (error: any) {
    console.error("Error updating username:", error.message);
    return { success: false, error: error.message };
  }
};

export const updatePassword = async (userId: string, newPassword: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    ).select("-password"); // Exclude password

    if (!user) {
      throw new Error("User not found");
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error: any) {
    console.error("Error updating password:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserWallet = async (
  userId: string,
  walletId: string,
  walletAddress: string
): Promise<{ success: boolean; message: string; user?: any }> => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      throw new Error("Invalid wallet ID");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          walletId: new Types.ObjectId(walletId),
          walletAddress: walletAddress,
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return { success: false, message: "User not found." };
    }

    return {
      success: true,
      message: "Wallet details updated successfully.",
      user: serializeUser(updatedUser),
    };
  } catch (error: any) {
    console.error("Error updating wallet details:", error);
    return { success: false, message: error.message };
  }
};

export const removeWallet = async (userId: string) => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Store wallet ID before removing it
    const walletId = user.walletId;

    // Remove wallet fields from user
    user.walletId = undefined;
    user.walletAddress = undefined;
    await user.save();

    // If there was a wallet, delete it
    if (walletId) {
      await mongoose.model("Wallet").findByIdAndDelete(walletId);
    }

    return {
      success: true,
      message: "Wallet disconnected successfully",
      user: serializeUser(user),
    };
  } catch (error: any) {
    console.error("Error removing wallet:", error);
    return { success: false, message: error.message };
  }
};

export const calculateReferralIncome = async (
  userId: string
): Promise<number> => {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    // Count how many users used the caller’s userReferralCode as their referralCode.
    const count = await User.countDocuments({
      referralCode: user.userReferralCode,
    });
    return count * 15;
  } catch (error: any) {
    console.error("Error calculating referral income:", error);
    throw new Error(error.message || "Error calculating referral income.");
  }
};

export const calculateMLMLevelIncome = async (
  userId: string
): Promise<number> => {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    // Count how many users used the caller’s userReferralCode as their referralCode.
    const referralCount = await User.countDocuments({
      referralCode: user.userReferralCode,
    });
    let level = 3;
    if (referralCount >= 5) {
      level = 1;
    } else if (referralCount >= 3) {
      level = 2;
    }
    if (level === 1) {
      return 8; // daily income of 8 if top level
    } else if (level === 2) {
      return 5;
    } else {
      return 2;
    }
  } catch (error: any) {
    console.error("Error calculating MLM level income:", error);
    throw new Error(error.message || "Error calculating MLM level income.");
  }
};

export const updateUserBalance = async (
  userId: string,
  roiIncome: number, // e.g., 1.5 for 1.5%
  levelIncome: number, // e.g., 8, 5, or 2
  referralIncome: number // e.g., 30 for 30%
) => {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found." };
    }

    const todayString = new Date().toDateString();
    const lastUpdate = user.get("lastIncomeUpdate");
    const alreadyUpdatedToday =
      lastUpdate && new Date(lastUpdate).toDateString() === todayString;

    const balance = user.balance;
    let roiEarned = 0;
    let levelEarned = 0;

    // Add ROI and Level income only once per day
    if (balance > 0 && !alreadyUpdatedToday) {
      roiEarned = (roiIncome / 100) * balance;
      levelEarned = (levelIncome / 100) * balance;

      user.set(
        "incomeAmount",
        (user.incomeAmount || 0) + roiEarned + levelEarned
      );
      user.set("lastIncomeUpdate", new Date());
    }

    // Calculate referral income every time
    const referralEarned = (referralIncome / 100) * balance;
    user.set("referralIncome", referralEarned);

    // Calculate total balance (balance + total income + referral)
    const totalBalance = balance + (user.incomeAmount || 0) + referralEarned;
    user.set("totalBalance", totalBalance);

    await user.save();

    return {
      success: true,
      balance,
      totalBalance,
      totalIncome: user.incomeAmount,
      referralIncome: user.referralIncome,
    };
  } catch (error: any) {
    console.error("Error updating user balance:", error);
    return {
      success: false,
      message: error.message || "Error updating user balance.",
    };
  }
};

export const getAllUsers = async () => {
  try {
    await connectToDatabase();
    const users = await User.find();
    const serializedUsers = users.map((user) => serializeUser(user));
    return { success: true, data: serializedUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
};

export const addRewardToUserBalance = async (
  userId: string,
  rewardAmount: number,
  rewardId: string
) => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      return { success: false, message: "Invalid reward ID" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return { success: false, message: "Reward not found" };
    }

    if (reward.status === "received") {
      return { success: false, message: "Reward already received" };
    }

    // ✅ Update user's actual balance field (not totalBalance)
    user.balance = (user.balance || 0) + rewardAmount;
    await user.save();

    // Mark reward as received
    reward.status = "received";
    await reward.save();

    return {
      success: true,
      message: "Balance updated and reward marked as received",
    };
  } catch (error: any) {
    console.error("Error updating user balance and reward status:", error);
    return {
      success: false,
      message: error.message || "Internal Server Error",
    };
  }
};

const getLiveEthereumValueInINR = async (): Promise<number> => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    );
    const ethToInr = response.data.ethereum.inr;
    if (!ethToInr) {
      throw new Error("Failed to fetch Ethereum value in INR.");
    }
    return ethToInr;
  } catch (error) {
    console.error("Error fetching live Ethereum value:", error);
    throw new Error("Unable to fetch live Ethereum value.");
  }
};

export const convertRsToEth = async (amountInRs: number): Promise<number> => {
  try {
    const ethToInr = await getLiveEthereumValueInINR();
    const amountInEth = amountInRs / ethToInr;
    return parseFloat(amountInEth.toFixed(8)); // Return up to 8 decimal places
  } catch (error) {
    console.error("Error converting INR to ETH:", error);
    throw new Error("Conversion from INR to ETH failed.");
  }
};

export const convertEthToRs = async (amountInEth: number): Promise<number> => {
  try {
    const ethToInr = await getLiveEthereumValueInINR();
    const amountInRs = amountInEth * ethToInr;
    return parseFloat(amountInRs.toFixed(2)); // Return up to 2 decimal places
  } catch (error) {
    console.error("Error converting ETH to INR:", error);
    throw new Error("Conversion from ETH to INR failed.");
  }
};
