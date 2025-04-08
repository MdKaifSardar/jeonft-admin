"use client"

import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { getAllWithdraws, allowWithdraw, rejectWithdraw } from "@/lib/actions/withdraw.actions";
import { toast } from "react-toastify";
import { getWalletAddressById } from "@/lib/actions/wallet.actions"; // added import

interface Withdraw {
  _id: string;
  amount: number;
  state: string;
  userId: string;       // added userId if needed
  walletId: string;     // used to fetch recipient wallet address
  // ...other fields...
}

const WithdrawComponent = () => {
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // New states for confirmation modal
  const [modalType, setModalType] = useState<"allow" | "reject" | null>(null);
  const [selectedWithdrawId, setSelectedWithdrawId] = useState<string | null>(null);

  const fetchWithdraws = async () => {
    try {
      const response = await getAllWithdraws();
      if (!response.success) throw new Error(response.message || "Failed to fetch withdraws");
      // Convert to plain objects before setting state
      setWithdraws(JSON.parse(JSON.stringify(response.data || [])));
    } catch (err: any) {
      console.error("Error fetching withdraws:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdraws();
  }, []);

  const confirmAction = async () => {
    if (!selectedWithdrawId || !modalType) return;
    if (modalType === "allow") {
      // Find the selected withdraw record to get transfer details
      const selectedWithdraw = withdraws.find((wd) => wd._id === selectedWithdrawId);
      if (!selectedWithdraw) {
        toast.error("Withdraw not found");
        return;
      }
      try {
        if (!(window as any).ethereum) {
          toast.error("MetaMask not found");
          return;
        }
        // Request admin account from MetaMask
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        const adminAccount = accounts[0];
        // Fetch recipient wallet address from the wallet action using the walletId from the withdraw record
        const walletResponse = await getWalletAddressById(selectedWithdraw.walletId);
        if (!walletResponse.success || !walletResponse.data) {
          toast.error("Failed to fetch recipient wallet address: " + walletResponse.message);
          return;
        }
        const recipientWalletAddress = walletResponse.data.walletAddress;
        // Convert the withdraw amount (assumed in ethers) into wei (hex string)
        const amountInWeiHex = "0x" + (selectedWithdraw.amount * 1e18).toString(16);
        const txParams = {
          from: adminAccount,
          to: recipientWalletAddress,
          value: amountInWeiHex,
        };
        // Execute the transfer via MetaMask
        const txHash = await (window as any).ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });
        toast.success("Transfer successful. Tx: " + txHash);
        // Now, call allowWithdraw to update state after successful transfer
        const result = await allowWithdraw(selectedWithdrawId);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    } else if (modalType === "reject") {
      const result = await rejectWithdraw(selectedWithdrawId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
    setModalType(null);
    setSelectedWithdrawId(null);
    // Refresh the withdraws list
    fetchWithdraws();
  };

  const handleShowAllowModal = (id: string) => {
    setSelectedWithdrawId(id);
    setModalType("allow");
  };

  const handleShowRejectModal = (id: string) => {
    setSelectedWithdrawId(id);
    setModalType("reject");
  };

  if (loading) return <Loader />;
  if (error) return <p>Error fetching withdraws: {error}</p>;

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Withdraws</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-purple-800">
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">ID</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">User ID</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Amount</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">State</th>
            <th className="px-4 py-2 border border-gray-300 text-white text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {withdraws.map((wd) => (
            <tr key={wd._id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border border-gray-300 text-center">{wd._id}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{wd.userId}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{wd.amount}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">{wd.state}</td>
              <td className="px-4 py-2 border border-gray-300 text-center">
                {wd.state === "pending" ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 mr-2"
                      onClick={() => handleShowAllowModal(wd._id)}
                    >
                      Allow
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1"
                      onClick={() => handleShowRejectModal(wd._id)}
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
      {modalType && selectedWithdrawId && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        >
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-bold mb-4">
              Confirm {modalType === "allow" ? "Allow" : "Reject"}
            </h3>
            <p className="mb-4">
              Are you sure you want to {modalType === "allow" ? "approve" : "reject"} this withdraw?
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
                  setSelectedWithdrawId(null);
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

export default WithdrawComponent;
