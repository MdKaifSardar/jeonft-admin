"use client";

import React, { useEffect, useState } from "react";
import {
  getAllDeposits,
  allowDeposit,
  rejectDeposit,
} from "@/lib/actions/deposit.actions";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";

interface Deposit {
  _id: string;
  amount: number;
  adminWalletAddress: string;
  state: string;
  userId: string; // added userId field
  unit: string; // added unit field
  // ...other fields...
}

const DepositComponent = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  // New states for confirmation modal
  const [modalType, setModalType] = useState<"allow" | "reject" | null>(null);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(
    null
  );

  // Extract fetchDeposits function to refresh the list
  const fetchDeposits = async () => {
    try {
      const response = await getAllDeposits();
      if (!response.success)
        throw new Error(response.message || "Failed to fetch deposits");
      // Convert to plain objects before setting state
      setDeposits(JSON.parse(JSON.stringify(response.data || [])));
    } catch (err: any) {
      console.error("Error fetching deposits:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // New confirm action function
  const confirmAction = async () => {
    if (!selectedDepositId || !modalType) return;
    if (modalType === "allow") {
      const result = await allowDeposit(selectedDepositId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else if (modalType === "reject") {
      const result = await rejectDeposit(selectedDepositId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
    setModalType(null);
    setSelectedDepositId(null);
    // Refetch deposits after update
    fetchDeposits();
  };

  // Modified handlers to show modal
  const handleShowAllowModal = (id: string) => {
    setSelectedDepositId(id);
    setModalType("allow");
  };

  const handleShowRejectModal = (id: string) => {
    setSelectedDepositId(id);
    setModalType("reject");
  };

  if (loading)
    return (
      <div className="mt-[2rem] ">
        <Loader />
      </div>
    );
  if (error) return <p>Error fetching deposits: {error}</p>;

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Deposits</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-green-800">
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">
              ID
            </th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">
              User ID
            </th>{" "}
            {/* new header */}
            <th className="px-4 py-2 border border-gray-300 text-white text-center">
              Amount
            </th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">
              Unit
            </th>{" "}
            {/* New column */}
            <th className="px-4 py-2 border border-gray-300 text-white text-center">
              State
            </th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {deposits.map((dep) => (
            <tr key={dep._id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border border-gray-300 text-center">
                {dep._id}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                {dep.userId}
              </td>{" "}
              {/* new cell */}
              <td className="px-4 py-2 border border-gray-300 text-center">
                {dep.amount}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                {dep.unit}
              </td>{" "}
              {/* New cell */}
              <td className="px-4 py-2 border border-gray-300 text-center">
                {dep.state}
              </td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                {dep.state === "pending" ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 mr-2"
                      onClick={() => handleShowAllowModal(dep._id)}
                    >
                      Allow
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1"
                      onClick={() => handleShowRejectModal(dep._id)}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span>No actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalType && selectedDepositId && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }} // transparent overlay
        >
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-bold mb-4">
              Confirm {modalType === "allow" ? "Allow" : "Reject"}
            </h3>
            <p className="mb-4">
              Are you sure you want to{" "}
              {modalType === "allow" ? "approve" : "reject"} this deposit?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedDepositId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositComponent;
