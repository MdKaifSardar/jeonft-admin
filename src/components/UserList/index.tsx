"use client"

import React, { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/actions/user.actions";
import Loader from "@/components/Loader";

interface User {
  _id: string;
  email: string;
  username: string;
  totalBalance: number; // changed from balance
  walletAddress?: string; // added walletAddress
  userReferralCode: string;
  createdAt: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch users");
        }
        // Convert to plain objects before setting state
        setUsers(JSON.parse(JSON.stringify(response.data || [])));
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Loader />;
  if (error) return <p>Error fetching users: {error}</p>;

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-blue-800">
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">#</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Email</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Username</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Total Balance</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Wallet Address</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Referral Code</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Created At</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {users.map((user, index) => (
            <tr key={user._id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border border-gray-300 text-center">{index + 1}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{user.email}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{user.username}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{user.totalBalance}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{user.walletAddress || "N/A"}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{user.userReferralCode}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
