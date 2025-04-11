"use client";

import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  calculateReferralIncome,
  calculateMLMLevelIncome,
  updateUserBalance,
} from "@/lib/actions/user.actions";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";

interface User {
  _id: string;
  email: string;
  username: string;
  totalBalance: number;
  balance: number;
  walletAddress?: string;
  userReferralCode: string;
  referralLink: string;
  createdAt: string;
}

interface IncomeDetails {
  roiIncome: string;
  roiPercentage: number;
  referralIncome: string;
  referralPercentage: number;
  levelIncome: string;
  levelPercentage: number;
  totalIncome: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [incomeDetails, setIncomeDetails] = useState<
    Record<string, IncomeDetails>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [calculatingIncome, setCalculatingIncome] = useState<boolean>(false); // New state for loader

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch users");
      }
      setUsers(response.data || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeDetails = async (users: User[]) => {
    setCalculatingIncome(true); // Show loader
    const details: Record<string, IncomeDetails> = {};
    for (const user of users) {
      const roiPercentage = 1.5; // ROI percentage

      // Calculate referral and level incomes using functions
      const referralPercentage = await calculateReferralIncome(user._id);
      const levelPercentage = await calculateMLMLevelIncome(user._id);

      // Update user balance with calculated incomes
      const updateResult = await updateUserBalance(
        user._id,
        roiPercentage,
        levelPercentage,
        referralPercentage
      );
      if (!updateResult.success) {
        console.error(
          `Failed to update balance for user ${user._id}:`,
          updateResult.message
        );
        continue;
      }

      const roiIncome = (roiPercentage / 100) * user.balance;
      const referralIncome = (referralPercentage / 100) * user.balance;
      const levelIncome = (levelPercentage / 100) * user.balance;
      const totalIncome = roiIncome + referralIncome + levelIncome;

      details[user._id] = {
        roiIncome: roiIncome.toFixed(2),
        roiPercentage,
        referralIncome: referralIncome.toFixed(2),
        referralPercentage,
        levelIncome: levelIncome.toFixed(2),
        levelPercentage,
        totalIncome: totalIncome.toFixed(2),
      };
    }
    setIncomeDetails(details);
    setCalculatingIncome(false); // Hide loader
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral link copied to clipboard!");
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUsers();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchIncomeDetails(users);
    }
  }, [users]);

  if (loading) return <Loader />;
  if (error) return <p>Error fetching users: {error}</p>;

  return (
    <div className="p-4">
      {users.map((user) => (
        <div
          key={user._id}
          className="mb-4 border border-gray-300 rounded shadow-md"
        >
          <div
            className="p-4 bg-blue-800 text-white font-semibold cursor-pointer flex justify-between items-center"
            onClick={() =>
              setExpandedUserId(expandedUserId === user._id ? null : user._id)
            }
          >
            <span>{user.username}</span>
            <span>{expandedUserId === user._id ? "-" : "+"}</span>
          </div>
          {expandedUserId === user._id && (
            <div className="p-4 bg-white">
              <h3 className="text-lg font-semibold mb-2">User Details</h3>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Wallet Address:</strong> {user.walletAddress || "N/A"}
              </p>
              <p>
                <strong>Referral Code:</strong> {user.userReferralCode}
              </p>
              <p>
                <strong>Referral Link:</strong>{" "}
                <a
                  href={user.referralLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {user.referralLink}
                </a>{" "}
                <button
                  onClick={() => copyToClipboard(user.referralLink)}
                  className="ml-2 hover:text-blue-400 font-bold hover:cursor-pointer text-black rounded"
                >
                  Copy
                </button>
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Balance:</strong> {user.balance} ETH
              </p>
              <p>
                <strong>Total Balance:</strong> {user.totalBalance} ETH
              </p>

              {calculatingIncome ? (
                <Loader /> // Show loader while calculating incomes
              ) : (
                incomeDetails[user._id] && (
                  <>
                    <h3 className="text-lg font-semibold mt-4 mb-2">
                      Income Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 border border-gray-300 rounded shadow-md">
                        <h4 className="font-semibold">ROI Income</h4>
                        <p>{incomeDetails[user._id].roiIncome} ETH</p>
                        <p>({incomeDetails[user._id].roiPercentage}%)</p>
                      </div>
                      <div className="p-4 border border-gray-300 rounded shadow-md">
                        <h4 className="font-semibold">Referral Income</h4>
                        <p>{incomeDetails[user._id].referralIncome} ETH</p>
                        <p>({incomeDetails[user._id].referralPercentage}%)</p>
                      </div>
                      <div className="p-4 border border-gray-300 rounded shadow-md">
                        <h4 className="font-semibold">Level Income</h4>
                        <p>{incomeDetails[user._id].levelIncome} ETH</p>
                        <p>({incomeDetails[user._id].levelPercentage}%)</p>
                      </div>
                      <div className="p-4 border border-gray-300 rounded shadow-md">
                        <h4 className="font-semibold">Total Income</h4>
                        <p>{incomeDetails[user._id].totalIncome} ETH</p>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
