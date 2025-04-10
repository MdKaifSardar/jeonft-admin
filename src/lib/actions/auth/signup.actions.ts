"use server";

import User from "@/lib/models/userModel";
import { hashPassword } from "../../../utils/bcrypt";
import { connectToDatabase } from "@/lib/database/db";
import { generateReferralCode } from "@/utils/referral-code-gen";
import { signToken } from "@/utils/jwt";

export const signup = async (
  email: string,
  username: string,
  password: string,
  referralCode?: string
) => {
  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "User with this email already exists." };
    }

    const hashedPassword = await hashPassword(password);
    const userReferralCode = generateReferralCode();

    // Generate referral link
    const referralLink = `https://jeonftuser.vercel.app/auth/ref-signup/${userReferralCode}`;

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      referralCode,
      userReferralCode,
      referralLink, // Add referral link
    });

    await newUser.save();

    const payload = { email, userId: newUser._id }; // Ensure userId is a string
    const token = await signToken(payload);

    return {
      success: true,
      message: "Signup successful.",
      token,
      userId: newUser._id, // Return userId as a string
    };
  } catch (error) {
    console.error("Error during signup:", error);
    return { success: false, error: "Failed to sign up." };
  }
};
