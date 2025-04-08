"use server";

import mongoose from "mongoose";
import { getUserById, getUserDetails } from "./user.actions";
import { connectToDatabase } from "../database/db";
import Reward, { IReward } from "../models/rewardModel";

export const createReward = async (userId: string, rewardAmount: number) => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const userResponse = await getUserDetails(userId);
    if (!userResponse.success) {
      return { success: false, message: "User not found" };
    }

    const rewardDoc = new Reward({
      amount: rewardAmount,
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending",
    });

    const reward = await rewardDoc.save();

    return {
      success: true,
      message: "Reward created successfully",
      data: {
        rewardId: reward._id.toString(),
        amount: reward.amount,
        userId: reward.userId.toString(),
        status: reward.status,
      },
    };
  } catch (error: any) {
    console.error("Error creating reward:", error);
    return { success: false, message: error.message };
  }
};


export const getAllRewards = async () => {
  try {
    await connectToDatabase();

    const rewards = await Reward.find();

    const rewardsWithUser = await Promise.all(
      rewards.map(async (reward) => {
        const userResult = await getUserById(reward.userId.toString());

        if (!userResult.success || !userResult.data) {
          throw new Error(`Failed to fetch user for reward: ${reward._id}`);
        }

        return {
          _id: reward._id.toString(),
          amount: reward.amount,
          user: {
            _id: userResult.data._id,
            username: userResult.data.username,
          },
        };
      })
    );

    return {
      success: true,
      data: rewardsWithUser,
    };
  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return { success: false, message: error.message };
  }
};

export const deleteReward = async (rewardId: string) => {
  try {
    await connectToDatabase();

    const deletedReward = await Reward.findByIdAndDelete(rewardId);
    if (!deletedReward) {
      return { success: false, message: "Reward not found" };
    }
    return { success: true, message: "Reward deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting reward:", error);
    return { success: false, message: error.message };
  }
};

export const getUserRewards = async (userId: string) => {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid user ID" };
    }

    const userResponse = await getUserDetails(userId);
    if (!userResponse.success) {
      return { success: false, message: "User not found" };
    }

    const rewards = await Reward.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    return {
      success: true,
      message: "Rewards fetched successfully",
      data: rewards.map((reward) => ({
        rewardId: reward._id.toString(),
        amount: reward.amount,
        status: reward.status,
        userId: reward.userId.toString(),
        createdAt: reward.createdAt,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return {
      success: false,
      message: error.message || "Internal Server Error",
    };
  }
};