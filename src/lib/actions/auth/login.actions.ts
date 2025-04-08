"use server";

import User from "@/lib/models/userModel";
import { verifyPassword } from "@/utils/bcrypt";
import { signToken } from "@/utils/jwt";
import { connectToDatabase } from "@/lib/database/db";

export const login = async (email: string, password: string) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify the password using bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password." };
    }

    const payload = { email, userId: user._id }; // Ensure userId is a string
    const token = await signToken(payload); // Generate token using signToken

    return {
      success: true,
      message: "Login successful.",
      token, // Return the token in the response
      userId: user._id, // Return userId as a string
    };
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, error: "Failed to log in." };
  }
};
