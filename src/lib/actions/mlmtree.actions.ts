"use server";

import User from "@/lib/models/userModel";
import { connectToDatabase } from "@/lib/database/db";

interface UserNode {
  username: string;
  userReferralCode: string;
  referralCode?: string;
  children: UserNode[];
}

export const fetchMLMTree = async (): Promise<UserNode[]> => {
  try {
    await connectToDatabase();
    const users = await User.find({});
    const userMap: Record<string, UserNode> = {};
    users.forEach((user: any) => {
      userMap[user.userReferralCode] = {
        username: user.username,
        userReferralCode: user.userReferralCode,
        referralCode: user.referralCode,
        children: [],
      };
    });
    const roots: UserNode[] = [];
    users.forEach((user: any) => {
      if (user.referralCode && userMap[user.referralCode]) {
        userMap[user.referralCode].children.push(
          userMap[user.userReferralCode]
        );
      } else {
        roots.push(userMap[user.userReferralCode]);
      }
    });
    return roots;
  } catch (error) {
    console.error("Error fetching MLM tree:", error); // Debugging log
    throw new Error("Failed to fetch MLM tree");
  }
};
